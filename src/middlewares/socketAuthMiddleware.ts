import { Socket } from 'socket.io';
import { AppError, authenticate, logger } from '@/common/utils';
import cookie from 'cookie';
import { knexDb } from '@/common/config';
import { userRepository } from '@/repository';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
	try {
		logger.info('Auth middleware running for socket connection attempt');

		// Parse cookies from the socket handshake headers
		const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};

		const accessToken = cookies.accessToken;
		const refreshToken = cookies.refreshToken;
		const impersonateUserId = cookies.impersonateUserId;

		if (!accessToken && !refreshToken) {
			return next(new AppError('Authentication required'));
		}

		// Authenticate the user
		const { currentUser } = await authenticate({
			accessToken,
			refreshToken,
		});

		let user = currentUser;

		// Handle impersonation if impersonateUserId is provided and the user is an admin
		if (impersonateUserId && currentUser.role === 'admin') {
			const impersonatedUser = await userRepository.findById(impersonateUserId);

			if (impersonatedUser) {
				user = impersonatedUser;
				socket.data.isImpersonating = true;
			}
		}

		// Fetch team memberships for the user
		const memberships = await knexDb('team_members')
			.where('memberId', user.id)
			.andWhere('isDeleted', false)
			.select('teamId');

		if (!memberships || memberships.length === 0) {
			return next(new AppError('User is not part of any teams'));
		}

		// Attach user and team information to the socket
		socket.data.user = {
			...user,
			teamIds: memberships.map((m) => m.teamId),
		};

		logger.info('Socket authentication successful');
		return next();
	} catch (error) {
		logger.error('Socket authentication failed', error);
		return next(new AppError('Authentication failed'));
	}
};
