import { ENVIRONMENT } from '@/common/config';
import { authenticate, parseTokenDuration, setCookie } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import type { NextFunction, Request, Response } from 'express';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
	const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];

	const { currentUser, accessToken: newAccessToken } = await authenticate({
		accessToken,
		refreshToken,
	});

	if (newAccessToken) {
		setCookie(req, res, 'accessToken', newAccessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
	}

	// attach the user to the request object
	req.user = currentUser;

	next();
});
