import { Socket } from 'socket.io';
import { AppError, authenticate, logger } from '@/common/utils';
import cookie from 'cookie';
import { knexDb } from '@/common/config';

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

		const memberships = await knexDb('team_members')
			.where('memberId', currentUser.id)
			.andWhere('isDeleted', false)
			.select('teamId');

		if (!memberships || memberships.length === 0) {
			return next(new AppError('User is not part of any teams'));
		}

		// Attach user to socket
		socket.data.user = {
			...currentUser,
			teamIds: memberships.map((m) => m.teamId),
		};

		logger.info('Socket authentication successful');
		return next();
	} catch {
		return next(new AppError('Authentication failed'));
	}
};
