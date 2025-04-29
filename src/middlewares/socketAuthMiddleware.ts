import { Socket } from 'socket.io';
import { AppError, authenticate, logger } from '@/common/utils';
import cookie from 'cookie';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
	try {
		logger.info('Auth middleware running for socket connection attempt');
		// Get tokens from handshake auth or headers
		const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};

		const accessToken = cookies.accessToken;
		const refreshToken = cookies.refreshToken;

		if (!accessToken && !refreshToken) {
			return next(new AppError('Authentication required'));
		}

		// Use your existing authenticate function
		const { currentUser } = await authenticate({
			accessToken,
			refreshToken,
		});

		// Attach user to socket
		socket.data.user = currentUser;

		logger.info('Socket authentication successful');
		return next();
	} catch {
		return next(new AppError('Authentication failed'));
	}
};
