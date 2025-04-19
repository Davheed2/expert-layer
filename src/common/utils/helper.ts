import bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { encode } from 'hi-base32';
import { ENVIRONMENT } from '../config';
import {
	ForgotPasswordData,
	IHashData,
	LoginEmailData,
	ResetPasswordData,
	SignUpEmailData,
	WelcomeEmailData,
} from '../interfaces';
import type { Response, Request } from 'express';
import { promisify } from 'util';
import otpGenerator from 'otp-generator';
import { addEmailToQueue } from '@/queues';

const generateRandomString = () => {
	return randomBytes(32).toString('hex');
};

const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 12);
};

const comparePassword = async (password: string, hashedPassword: string) => {
	return await bcrypt.compare(password, hashedPassword);
};

const generateRandomBase32 = () => {
	const buffer = randomBytes(15);
	return encode(buffer).replace(/=/g, '').substring(0, 24);
};

const generateRandom6DigitKey = () => {
	let randomNum = randomInt(0, 999999);

	// Ensure the number is within the valid range (000000 to 999999)
	while (randomNum < 100000) {
		randomNum = randomInt(0, 999999);
	}
	// Convert the random number to a string and pad it with leading zeros if necessary
	return randomNum.toString().padStart(6, '0');
};

const toJSON = <T extends object>(obj: T | T[], excludeFields: (keyof T)[] = []): Partial<T> | Partial<T>[] => {
	// Helper function to sanitize a single object
	const sanitizeObject = (item: T): Partial<T> => {
		const sanitized: Partial<T> = JSON.parse(JSON.stringify(item));
		finalExclusions.forEach((field) => delete sanitized[field]);
		return sanitized;
	};

	// Default fields to exclude
	const defaultExclusions: (keyof T)[] = [
		'loginRetries',
		'lastLogin',
		'password',
		'updated_at',
		'ipAddress',
		'passwordResetToken',
		'passwordResetExpires',
		'passwordChangedAt',
		'passwordResetRetries',
		'verificationToken',
		'verificationTokenExpires',
		'tokenIsUsed',
		'isEmailVerified',
	] as (keyof T)[];

	// Use provided exclusions or default ones
	const finalExclusions = excludeFields.length > 0 ? excludeFields : defaultExclusions;

	// Handle array or single object
	if (Array.isArray(obj)) {
		return obj.map(sanitizeObject);
	} else {
		return sanitizeObject(obj);
	}
};

const parseTokenDuration = (duration: string): number => {
	const match = duration.match(/(\d+)([smhd])/);
	if (!match) return 0;

	const value = parseInt(match[1]);
	const unit = match[2];

	switch (unit) {
		case 's':
			return value * 1000;
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		case 'd':
			return value * 24 * 60 * 60 * 1000;
		default:
			return 0;
	}
};

const isMobile = (req: Request): 'mobile' | 'browser' => {
	const customHeader = req.headers['expertlayer'];
	if (customHeader) {
		return 'mobile';
	}

	return 'browser';
};

const setCookie = (
	req: Request,
	res: Response,
	name: string,
	value: string,
	//options: CookieOptions = {},
	maxAge: number
) => {
	const clientType = isMobile(req);
	if (clientType === 'mobile') {
		if (name === 'accessToken') res.locals.newAccessToken = value;
		if (name === 'refreshToken') res.locals.newRefreshToken = value;
	} else {
		res.cookie(name, value, {
			httpOnly: true,
			secure: ENVIRONMENT.APP.ENV === 'production',
			path: '/',
			sameSite: ENVIRONMENT.APP.ENV === 'production' ? 'none' : 'lax',
			partitioned: ENVIRONMENT.APP.ENV === 'production',
			maxAge,
		});
	}
};

const dateFromString = async (value: string) => {
	const date = new Date(value);

	if (isNaN(date?.getTime())) {
		return false;
	}

	return date;
};

const createToken = (data: IHashData, options?: SignOptions, secret?: string) => {
	return jwt.sign({ ...data }, secret ? secret : ENVIRONMENT.JWT.AUTH_SECRET, {
		algorithm: 'HS256',
		expiresIn: options?.expiresIn,
	});
};

const verifyToken = async (token: string, secret?: string) => {
	const verifyAsync: (arg1: string, arg2: string) => jwt.JwtPayload = promisify(jwt.verify);

	const verify = verifyAsync(token, secret ? secret : ENVIRONMENT.JWT.AUTH_SECRET!);
	return verify;
};

const generateAccessToken = (userId: string): string => {
	return createToken(
		{ id: userId },
		{ expiresIn: parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS) },
		ENVIRONMENT.JWT.ACCESS_SECRET
	);
};

const generateRefreshToken = (userId: string): string => {
	return createToken(
		{ id: userId },
		{ expiresIn: parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH) },
		ENVIRONMENT.JWT.REFRESH_SECRET
	);
};

const isValidFileNameAwsUpload = (fileName: string): boolean => {
	const regex = /^([a-zA-Z0-9\s\-+_!@#$%^&*(),./]+)(?:\.(mp4|mov|webm|avi))$/i;
	return regex.test(fileName);
};

const isValidPhotoNameAwsUpload = (fileName: string) => {
	const regex = /^([a-zA-Z0-9\s\-+_!@#$%^&*(),./]+)(?:\.(jpg|png|jpeg))$/i;
	return regex.test(fileName);
};

const getDomainReferer = (req: Request) => {
	try {
		const referer = req.get('x-referer');

		if (!referer) {
			return `${ENVIRONMENT.FRONTEND_URL}`;
		}

		return referer;
	} catch (error) {
		console.log(error);
		return null;
	}
};

const formatTimeSpent = (totalSeconds: number): string => {
	if (totalSeconds < 0) {
		throw new Error('Time cannot be negative');
	}

	const days = Math.floor(totalSeconds / (24 * 60 * 60));
	const remainingSeconds = totalSeconds % (24 * 60 * 60);
	const hours = Math.floor(remainingSeconds / (60 * 60));
	const remainingMinutes = Math.floor(remainingSeconds / 60) % 60;
	const seconds = remainingSeconds % 60;

	let formattedTime = '';

	if (days > 0) {
		formattedTime += `${days}day`;
		if (days > 1) formattedTime += 's';
		if (hours > 0 || remainingMinutes > 0 || seconds > 0) formattedTime += ':';
	}

	if (hours > 0) {
		formattedTime += `${hours}hr`;
		if (hours > 1) formattedTime += 's';
		if (remainingMinutes > 0 || seconds > 0) formattedTime += ':';
	}

	if (remainingMinutes > 0) {
		formattedTime += `${remainingMinutes}min`;
		if (remainingMinutes > 1) formattedTime += 's';
		if (seconds > 0) formattedTime += ':';
	}

	if (seconds > 0) {
		formattedTime += `${seconds}sec`;
		if (seconds > 1) formattedTime += 's';
	}

	if (formattedTime === '') {
		formattedTime = '0sec';
	}

	return formattedTime;
};

const parseTimeSpent = (timeStr: string): number => {
	if (!timeStr || timeStr === '0sec') return 0;

	let totalSeconds = 0;
	const parts = timeStr.split(':');

	parts.forEach((part) => {
		if (part.includes('day')) {
			const days = parseInt(part, 10);
			totalSeconds += days * 24 * 60 * 60;
		} else if (part.includes('hr')) {
			const hours = parseInt(part, 10);
			totalSeconds += hours * 60 * 60;
		} else if (part.includes('min')) {
			const minutes = parseInt(part, 10);
			totalSeconds += minutes * 60;
		} else if (part.includes('sec')) {
			const seconds = parseInt(part, 10);
			totalSeconds += seconds;
		}
	});

	return totalSeconds;
};

const formatDuration = (seconds: number): string => {
	if (seconds < 0) {
		throw new Error('Duration cannot be negative');
	}

	const hours = Math.floor(seconds / 3600); // Convert to hours
	const remainingSeconds = seconds % 3600;
	const minutes = Math.floor(remainingSeconds / 60); // Convert remaining to minutes
	const secs = Math.floor(remainingSeconds % 60); // Remaining seconds

	if (hours > 0) {
		// Format as HH:MM:SS (e.g., 01:20:08)
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	} else if (minutes > 0) {
		// Format as MM:SS (e.g., 20:20)
		return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	} else {
		// Format as SS (e.g., 00:30, but ensure at least MM:SS for consistency)
		return `00:${String(secs).padStart(2, '0')}`;
	}
};

const generateOtp = () => {
	return otpGenerator.generate(6, {
		digits: true,
		upperCaseAlphabets: false,
		specialChars: false,
		lowerCaseAlphabets: false,
	});
};

const sendSignUpEmail = async (email: string, name: string, verificationUrl: string): Promise<void> => {
	const emailData: SignUpEmailData = {
		to: email,
		priority: 'high',
		name,
		verificationUrl,
	};

	addEmailToQueue({
		type: 'signUpEmail',
		data: emailData,
	});
};

const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
	const emailData: WelcomeEmailData = {
		to: email,
		priority: 'high',
		name,
	};

	addEmailToQueue({
		type: 'welcomeEmail',
		data: emailData,
	});
};

const sendLoginEmail = async (email: string, name: string, time: string): Promise<void> => {
	const emailData: LoginEmailData = {
		to: email,
		priority: 'high',
		name,
		time,
	};

	addEmailToQueue({
		type: 'loginEmail',
		data: emailData,
	});
};

const sendForgotPasswordEmail = async (email: string, name: string, resetLink: string): Promise<void> => {
	const emailData: ForgotPasswordData = {
		to: email,
		priority: 'high',
		name,
		resetLink,
	};

	addEmailToQueue({
		type: 'forgotPassword',
		data: emailData,
	});
};

const sendResetPasswordEmail = async (email: string, name: string): Promise<void> => {
	const emailData: ResetPasswordData = {
		to: email,
		priority: 'high',
		name,
	};

	addEmailToQueue({
		type: 'resetPassword',
		data: emailData,
	});
};

export {
	dateFromString,
	generateRandom6DigitKey,
	generateRandomBase32,
	generateRandomString,
	hashPassword,
	comparePassword,
	toJSON,
	parseTokenDuration,
	setCookie,
	createToken,
	verifyToken,
	isValidFileNameAwsUpload,
	isValidPhotoNameAwsUpload,
	generateAccessToken,
	generateRefreshToken,
	getDomainReferer,
	formatTimeSpent,
	parseTimeSpent,
	formatDuration,
	generateOtp,
	sendSignUpEmail,
	sendWelcomeEmail,
	sendLoginEmail,
	sendResetPasswordEmail,
	sendForgotPasswordEmail,
};
