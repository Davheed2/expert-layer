import { Response, Request } from 'express';

export const AppResponse = (
	res: Response,
	statusCode: number = 200,
	data: Record<string, string[]> | unknown | string | null,
	message: string,
	req?: Request
) => {
	const newTokens: { newAccessToken?: string; newRefreshToken?: string } = {};

	if (res.locals.newAccessToken) {
		newTokens.newAccessToken = res.locals.newAccessToken;
	}
	if (res.locals.newRefreshToken) {
		newTokens.newRefreshToken = res.locals.newRefreshToken;
	}

	res.status(statusCode).json({
		status: 'success',
		data: data ?? null,
		...(newTokens?.newAccessToken && newTokens),
		message: message ?? 'Success',
		isImpersonating: req?.isImpersonating || false,
	});
};
