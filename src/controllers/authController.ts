import { teamRepository, userRepository } from '@/repository';
import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	comparePassword,
	generateAccessToken,
	generateOtp,
	generateReferralCode,
	generateRefreshToken,
	hashPassword,
	logger,
	parseTokenDuration,
	sendLoginEmail,
	sendMagicLinkEmail,
	sendResetPasswordEmail,
	sendSignUpEmail,
	sendWelcomeEmail,
	setCookie,
	toJSON,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { ENVIRONMENT } from '@/common/config';
import { DateTime } from 'luxon';
import { Notification } from '@/services/Notification';
import { NotificationSource } from '@/common/constants';
import { Team } from '@/services/Team';
import { IUser } from '@/common/interfaces';

class AuthController {
	signUp = catchAsync(async (req: Request, res: Response) => {
		const { email, firstName, lastName, role, referralCode } = req.body;

		if (!firstName || !lastName || !email || !role) {
			throw new AppError('Incomplete signup data', 400);
		}

		const existingUser = await userRepository.findByEmail(email);
		if (existingUser) {
			if (existingUser.email === email) throw new AppError('User with this email already exists', 409);
		}

		// const verificationToken = await generateRandomString();
		// const hashedVerificationToken = createToken(
		// 	{
		// 		token: verificationToken,
		// 	},
		// 	{ expiresIn: '30d' }
		// );

		//const verificationUrl = `${getDomainReferer(req)}/auth/verify?verificationToken=${hashedVerificationToken}`;
		let referrer: IUser | null = null;
		if (referralCode) {
			referrer = await userRepository.findByReferralCode(referralCode);
			console.log(referrer);
			if (!referrer) {
				throw new AppError('Invalid referral code', 400);
			}
		}

		const generatedOtp = generateOtp();
		const referCode = generateReferralCode();

		const [user] = await userRepository.create({
			email,
			password: null,
			firstName,
			lastName,
			ipAddress: req.ip,
			role,
			verificationToken: generatedOtp,
			verificationTokenExpires: DateTime.now().plus({ days: 1 }).toJSDate(),
			referralCode: referCode,
		});
		if (!user) {
			throw new AppError('Failed to create user', 500);
		}

		if (referrer) {
			const team = await teamRepository.getTeamByOwnerId(referrer.id);
			if (!team) {
				throw new AppError('Referrer team not found', 404);
			}

			await Team.addMember({
				teamId: team.id,
				ownerId: team.ownerId,
				memberId: user.id,
				memberType: user.role,
			});
		}

		await sendSignUpEmail(email, firstName, generatedOtp);

		return AppResponse(res, 201, toJSON([user]), `Verification link sent to ${email}`);
	});

	verifyAccount = catchAsync(async (req: Request, res: Response) => {
		const { verificationToken } = req.body;

		if (!verificationToken) {
			throw new AppError('Verification token is required', 400);
		}

		const extinguishUser = await userRepository.findByVerificationToken(verificationToken);
		if (!extinguishUser) {
			throw new AppError('Invalid or expired verification token', 404);
		}
		if (extinguishUser.isEmailVerified) {
			throw new AppError('Account Already Verified', 400);
		}
		if (extinguishUser.tokenIsUsed) {
			throw new AppError('Verification token has already been used', 400);
		}
		if (
			!extinguishUser.verificationTokenExpires ||
			extinguishUser.verificationTokenExpires < DateTime.now().toJSDate()
		) {
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

		const accessToken = generateAccessToken(extinguishUser.id);
		const refreshToken = generateRefreshToken(extinguishUser.id);

		setCookie(req, res, 'accessToken', accessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
		setCookie(req, res, 'refreshToken', refreshToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH));

		AppResponse(res, 200, toJSON(updatedUser), 'Email verified successfully');

		setImmediate(async () => {
			try {
				const team = await Team.add({
					name: `${updatedUser[0].firstName} ${updatedUser[0].lastName}'s Organization`,
					ownerId: updatedUser[0].id,
				});
				await Team.addMember({
					teamId: team.id,
					memberId: updatedUser[0].id,
					ownerId: updatedUser[0].id,
					memberType: updatedUser[0].role,
				});

				const admins = await userRepository.findAllAdmins();
				for (const admin of admins) {
					await Notification.add({
						userId: admin.id,
						title: 'New user registered',
						message: `The user ${updatedUser[0].firstName} ${updatedUser[0].lastName} just registered.`,
						source: NotificationSource.CLIENT,
					});
				}
			} catch (err) {
				logger.error('Error during background team creation', err);
			}
		});
	});

	signIn = catchAsync(async (req: Request, res: Response) => {
		const { email } = req.body;

		if (!email) {
			throw new AppError('Incomplete login data', 401);
		}

		const user = await userRepository.findByEmail(email);
		if (!user) {
			throw new AppError('User not found', 404);
		}

		if (!user.isEmailVerified) {
			throw new AppError('Your account is not yet verified', 401);
		}
		if (user.isSuspended) {
			throw new AppError('Your account is currently suspended', 401);
		}

		const currentRequestTime = DateTime.now();
		const lastLoginRequest = currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'minutes');

		if (user.lastLogin && Math.round(lastLoginRequest.minutes) < 1) {
			throw new AppError('Please wait before requesting another login link', 429);
		}

		const generatedOtp = generateOtp();
		const otpExpires = currentRequestTime.plus({ minutes: 15 }).toJSDate();

		//const loginUrl = `${getDomainReferer(req)}/auth/login?token=${hashedLoginToken}`;
		await userRepository.update(user.id, {
			loginToken: generatedOtp,
			loginTokenExpires: otpExpires,
			lastLogin: currentRequestTime.toJSDate(),
		});

		await sendMagicLinkEmail(user.email, user.firstName, generatedOtp);

		return AppResponse(res, 200, null, 'Login link sent to your email');
	});

	verifyLogin = catchAsync(async (req: Request, res: Response) => {
		const { otp } = req.body;

		if (!otp) {
			throw new AppError('OTP is required', 400);
		}

		const user = await userRepository.findByLoginToken(otp);
		if (!user) {
			throw new AppError('User not found', 404);
		}
		if (user.loginToken !== otp) {
			throw new AppError('Invalid OTP', 401);
		}

		if (!user.loginTokenExpires || user.loginTokenExpires < DateTime.now().toJSDate()) {
			throw new AppError('OTP has expired', 400);
		}

		const accessToken = generateAccessToken(user.id);
		const refreshToken = generateRefreshToken(user.id);

		setCookie(req, res, 'accessToken', accessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
		setCookie(req, res, 'refreshToken', refreshToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH));

		await userRepository.update(user.id, {
			loginToken: null,
			loginTokenExpires: null,
			lastLogin: DateTime.now().toJSDate(),
		});

		const loginTime = DateTime.now().toFormat("cccc, LLLL d, yyyy 'at' t");
		await sendLoginEmail(user.email, user.firstName, loginTime);

		return AppResponse(res, 200, toJSON([user]), 'User logged in successfully');
	});

	changePassword = catchAsync(async (req: Request, res: Response) => {
		const { password, confirmPassword } = req.body;
		const { user } = req;

		if (!password || !confirmPassword) {
			throw new AppError('All fields are required', 403);
		}
		if (password !== confirmPassword) {
			throw new AppError('Passwords do not match', 403);
		}
		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		const extinguishUser = await userRepository.findById(user.id);
		if (!extinguishUser) {
			throw new AppError('User not found', 400);
		}
		if (!extinguishUser.password) {
			throw new AppError('No existing password set for this user', 400);
		}

		const isSamePassword = await comparePassword(password, extinguishUser.password);
		if (isSamePassword) {
			throw new AppError('New password cannot be the same as the old password', 400);
		}

		const hashedPassword = await hashPassword(password);

		const updatedUser = await userRepository.update(extinguishUser.id, {
			password: hashedPassword,
			passwordResetRetries: 0,
			passwordChangedAt: DateTime.now().toJSDate(),
			passwordResetToken: '',
			passwordResetExpires: DateTime.now().toJSDate(),
		});
		if (!updatedUser) {
			throw new AppError('Password reset failed', 400);
		}

		await sendResetPasswordEmail(extinguishUser.email, extinguishUser.firstName);

		return AppResponse(res, 200, null, 'Password reset successfully');
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

	appHealth = catchAsync(async (req: Request, res: Response) => {
		return AppResponse(res, 200, null, 'Server is healthy');
	});
}

export const authController = new AuthController();
