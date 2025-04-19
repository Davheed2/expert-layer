import { ENVIRONMENT } from '@/common/config';
import { AppError, logger } from '@/common/utils';
import { Response, Request, NextFunction } from 'express';

const handleJWTError = () => {
	return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
	return new AppError('Your token has expired!', 401);
};

const handleTimeoutError = () => {
	return new AppError('Request timeout', 408);
};

const handleInvalidUUIDError = () => {
	return new AppError('Invalid UUID format provided', 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		stack: err.stack,
		error: err.data,
	});
};

const sendErrorProd = (err: AppError, res: Response) => {
	const { isOperational } = err;

	const statusCode = isOperational ? err.statusCode : 500;
	const message = isOperational ? err.message : 'Something went very wrong!';
	const data = isOperational ? err.data : null;
	const status = isOperational ? err.status : 'error';

	console.error('An error occurred in the server ==> : ', err);

	return res.status(statusCode).json({
		status: status,
		message: message,
		error: data,
	});
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err, req: Request, res: Response, next: NextFunction) => {
	err.statusCode = err?.statusCode || 500;
	err.status = err?.status || 'Error';
	let error = err;

	switch (ENVIRONMENT.APP.ENV) {
		case 'development':
			logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
			return sendErrorDev(err, res);
		case 'production':
			switch (true) {
				case 'timeout' in err && err.timeout:
					error = handleTimeoutError();
					break;
				case err.name === 'JsonWebTokenError':
					error = handleJWTError();
					break;
				case err.name === 'TokenExpiredError':
					error = handleJWTExpiredError();
					break;
				case err.code === '22P02':
					error = handleInvalidUUIDError();
					break;
				default:
					break;
			}

			return sendErrorProd(error, res);
		default:
			return sendErrorDev(err, res);
	}
};
