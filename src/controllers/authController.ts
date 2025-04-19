import { userRepository } from '@/repository';
import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	comparePassword,
	createToken,
	generateAccessToken,
	generateRandomString,
	generateRefreshToken,
	getDomainReferer,
	hashPassword,
	parseTokenDuration,
	sendForgotPasswordEmail,
	sendLoginEmail,
	sendResetPasswordEmail,
	sendSignUpEmail,
	sendWelcomeEmail,
	setCookie,
	toJSON,
	verifyToken,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { ENVIRONMENT } from '@/common/config';
import { DateTime } from 'luxon';
import { Notification } from '@/services/Notification';
import { NotificationSource } from '@/common/constants';

class AuthController {
	signUp = catchAsync(async (req: Request, res: Response) => {
		const { email, password, firstName, lastName, role } = req.body;

		if (!firstName || !lastName || !email || !password || !role) {
			throw new AppError('Incomplete signup data', 400);
		}

		const existingUser = await userRepository.findByEmail(email);
		if (existingUser) {
			if (existingUser.email === email) throw new AppError('User with this email already exists', 409);
		}

		const hashedPassword = await hashPassword(password);

		const verificationToken = await generateRandomString();
		const hashedVerificationToken = createToken(
			{
				token: verificationToken,
			},
			{ expiresIn: '30d' }
		);
		console.log(hashedVerificationToken);

		const verificationUrl = `${getDomainReferer(req)}/auth?verify=${hashedVerificationToken}`;
		await sendSignUpEmail(email, firstName, verificationUrl);

		const [user] = await userRepository.create({
			email,
			password: hashedPassword,
			firstName,
			lastName,
			ipAddress: req.ip,
			role,
			verificationToken,
			verificationTokenExpires: DateTime.now().plus({ days: 30 }).toJSDate(),
		});
		if (!user) {
			throw new AppError('Failed to create user', 500);
		}

		return AppResponse(res, 201, toJSON([user]), `Verification link sent to ${email}`);
	});

	verifyAccount = catchAsync(async (req: Request, res: Response) => {
		const { verificationToken } = req.query;

		if (!verificationToken) {
			throw new AppError('Verification token is required', 400);
		}

		const decodedVerificationToken = await verifyToken(verificationToken as string);
		if (!decodedVerificationToken.token) {
			throw new AppError('Invalid verification token', 401);
		}

		const extinguishUser = await userRepository.findByVerificationToken(decodedVerificationToken.token);
		if (!extinguishUser) {
			throw new AppError('Invalid or expired verification token', 404);
		}
		if (extinguishUser.isEmailVerified) {
			throw new AppError('Account Already Verified', 400);
		}
		if (extinguishUser.tokenIsUsed) {
			throw new AppError('Verification token has already been used', 400);
		}
		if (extinguishUser.verificationTokenExpires < DateTime.now().toJSDate()) {
			throw new AppError('Verification token has expired', 400);
		}

		const updatedUser = await userRepository.update(extinguishUser.id, {
			tokenIsUsed: true,
			isEmailVerified: true,
		});

		await sendWelcomeEmail(extinguishUser.email, extinguishUser.firstName);
		await Notification.add({
			userId: updatedUser[0].id,
			sysNotificationId: 1,
		});

		AppResponse(res, 200, toJSON(updatedUser), 'Email verified successfully');

		setImmediate(async () => {
			const admins = await userRepository.findAllAdmins();
			for (const admin of admins) {
				await Notification.add({
					userId: admin.id,
					title: 'New user registered',
					message: `The user ${updatedUser[0].firstName} ${updatedUser[0].lastName} just registered.`,
					source: NotificationSource.CLIENT,
				});
			}
		});
	});

	signIn = catchAsync(async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new AppError('Incomplete login data', 401);
		}

		const user = await userRepository.findByEmail(email);
		if (!user) {
			throw new AppError('User not found', 404);
		}

		const currentRequestTime = DateTime.now();
		const lastLoginRetry = currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'hours');

		if (user.loginRetries >= 5 && Math.round(lastLoginRetry.hours) < 12) {
			throw new AppError('login retries exceeded!', 401);
		}

		const isPasswordValid = await comparePassword(password, user.password);
		if (!isPasswordValid) {
			await userRepository.update(user.id, { loginRetries: user.loginRetries + 1 });
			throw new AppError('Invalid credentials', 401);
		}

		if (!user.isEmailVerified) {
			throw new AppError('Your account is not yet verified', 401);
		}
		if (user.isSuspended) {
			throw new AppError('Your account is currently suspended', 401);
		}

		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		setCookie(req, res, 'accessToken', accessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
		setCookie(req, res, 'refreshToken', refreshToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH));

		await userRepository.update(user.id, {
			loginRetries: 0,
			lastLogin: currentRequestTime.toJSDate(),
		});

		//login email
		const loginTime = DateTime.now().toFormat("cccc, LLLL d, yyyy 'at' t");
		await sendLoginEmail(user.email, user.firstName, loginTime);
		return AppResponse(res, 200, toJSON([user]), 'User logged in successfully');
	});

	signOut = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		setCookie(req, res, 'accessToken', 'expired', -1);
		setCookie(req, res, 'refreshToken', 'expired', -1);

		AppResponse(res, 200, null, 'Logout successful');
	});

	forgotPassword = catchAsync(async (req: Request, res: Response) => {
		const { email } = req.body;

		if (!email) {
			throw new AppError('Email is required', 400);
		}

		const user = await userRepository.findByEmail(email);
		if (!user) {
			throw new AppError('No user found with provided email', 404);
		}

		if (user.passwordResetRetries >= 6) {
			await userRepository.update(user.id, {
				isSuspended: true,
			});

			throw new AppError('Password reset retries exceeded! and account suspended', 401);
		}

		const passwordResetToken = await generateRandomString();
		const hashedPasswordResetToken = createToken(
			{
				token: passwordResetToken,
			},
			{ expiresIn: '15m' }
		);

		console.log(hashedPasswordResetToken);

		const passwordResetUrl = `${getDomainReferer(req)}/reset-password?token=${hashedPasswordResetToken}`;

		await userRepository.update(user.id, {
			passwordResetToken: passwordResetToken,
			passwordResetExpires: DateTime.now().plus({ minutes: 15 }).toJSDate(),
			passwordResetRetries: user.passwordResetRetries + 1,
		});

		await sendForgotPasswordEmail(user.email, user.firstName, passwordResetUrl);

		return AppResponse(res, 200, null, `Password reset link sent to ${email}`);
	});

	resetPassword = catchAsync(async (req: Request, res: Response) => {
		const { token, password, confirmPassword } = req.body;

		if (!token || !password || !confirmPassword) {
			throw new AppError('All fields are required', 403);
		}
		if (password !== confirmPassword) {
			throw new AppError('Passwords do not match', 403);
		}

		const decodedToken = await verifyToken(token);
		if (!decodedToken.token) {
			throw new AppError('Invalid token', 401);
		}

		const user = await userRepository.findByPasswordResetToken(decodedToken.token);
		if (!user) {
			throw new AppError('Password reset token is invalid or has expired', 400);
		}

		const isSamePassword = await comparePassword(password, user.password);
		if (isSamePassword) {
			throw new AppError('New password cannot be the same as the old password', 400);
		}

		const hashedPassword = await hashPassword(password);

		const updatedUser = await userRepository.update(user.id, {
			password: hashedPassword,
			passwordResetRetries: 0,
			passwordChangedAt: DateTime.now().toJSDate(),
			passwordResetToken: '',
			passwordResetExpires: DateTime.now().toJSDate(),
		});
		if (!updatedUser) {
			throw new AppError('Password reset failed', 400);
		}

		await sendResetPasswordEmail(user.email, user.firstName);
		await Notification.add({
			userId: updatedUser[0].id,
			sysNotificationId: 2,
		});

		return AppResponse(res, 200, null, 'Password reset successfully');
	});

	appHealth = catchAsync(async (req: Request, res: Response) => {
		return AppResponse(res, 200, null, 'Server is healthy');
	});
}

export const authController = new AuthController();
