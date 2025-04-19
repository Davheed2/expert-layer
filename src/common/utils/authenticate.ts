import { ENVIRONMENT } from '@/common/config';
import type { IUser } from '@/common/interfaces';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import AppError from './appError';
import { generateAccessToken, verifyToken } from './helper';
import { AuthenticateResult } from '../types';
import { userRepository } from '@/repository';

export const authenticate = async ({
	accessToken,
	refreshToken,
}: {
	accessToken?: string;
	refreshToken?: string;
}): Promise<AuthenticateResult> => {
	if (!refreshToken) {
		throw new AppError('Unauthorized', 401);
	}

	const handleUserVerification = async (decoded: jwt.JwtPayload): Promise<IUser> => {
		const currentUser = await userRepository.findById(decoded.id);

		if (!currentUser) throw new AppError('User not found', 404);
		if (!currentUser.isEmailVerified) throw new AppError('Please verify your email address to continue', 401);
		if (currentUser.isSuspended) throw new AppError('Your account is currently suspended', 401);
		if (currentUser.isDeleted) throw new AppError('Your account has been deleted', 404);

		// check if user has changed password after the token was issued
		// if so, invalidate the token
		if (
			currentUser.passwordChangedAt &&
			DateTime.fromISO(currentUser.passwordChangedAt.toISOString()).toMillis() >
				DateTime.fromMillis((decoded.iat ?? 0) * 1000).toMillis()
		) {
			throw new AppError('Password changed since last login. Please log in again!', 401);
		}
		// csrf protection
		// browser client fingerprinting
		return currentUser;
	};

	const handleTokenRefresh = async () => {
		const decodeRefreshToken = await verifyToken(refreshToken, ENVIRONMENT.JWT.REFRESH_SECRET!);
		const currentUser = await handleUserVerification(decodeRefreshToken);
		const accessToken = generateAccessToken(currentUser.id);
		return { accessToken, currentUser };
	};

	try {
		if (!accessToken) return await handleTokenRefresh();

		const decodeAccessToken = await verifyToken(accessToken, ENVIRONMENT.JWT.ACCESS_SECRET!);
		const currentUser = await handleUserVerification(decodeAccessToken);
		return { currentUser };
	} catch (error) {
		if ((error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) && refreshToken) {
			try {
				return await handleTokenRefresh();
			} catch (refreshError) {
				console.log('Refresh error:', refreshError);
				throw new AppError('Session expired, please log in again', 401);
			}
		}
		throw new AppError('An error occurred, please log in again', 401);
	}
};
