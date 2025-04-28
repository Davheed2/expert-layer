import { Socket } from 'socket.io';
import { AppError, authenticate, logger } from '@/common/utils';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
	try {
		logger.info('Auth middleware running for socket connection attempt');
		// Get tokens from handshake auth or headers
		const accessToken = socket.handshake.auth.accessToken || socket.handshake.headers.authorization?.split(' ')[1];
		const refreshToken = socket.handshake.auth.refreshToken || socket.handshake.headers['x-refresh-token'];

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
