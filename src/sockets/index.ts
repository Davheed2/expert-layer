import { Server as SocketIOServer } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { messageHandler } from './handlers/messageHandler';
import { presenceHandler } from './handlers/presenceHandler';
import { teamHandler } from './handlers/teamHandler';
import { logger } from '@/common/utils';
import { getUserTeamIds } from './services/teamService';

// Global map to track online users
export const onlineUsers = new Map();

export const initSocketHandlers = (io: SocketIOServer) => {
	io.on(SocketEvents.CONNECT, async (socket) => {
		const user = socket.data.user;

		logger.info(`User connected: ${user.id}`);

		// Join all team rooms
		const teamIds = await getUserTeamIds(user.id);
		teamIds.forEach((teamId) => {
			const roomId = `team:${teamId}`;
			socket.join(roomId);

			// Notify only this team about the online user
			socket.to(roomId).emit(SocketEvents.USER_ONLINE, { userId: user.id });
		});

		// Track online user
		onlineUsers.set(user.id, {
			socketId: socket.id,
			lastSeen: new Date(),
		});

		// Initialize handlers
		messageHandler(io, socket);
		presenceHandler(io, socket);
		teamHandler(io, socket);

		// Handle disconnect
		socket.on(SocketEvents.DISCONNECT, () => {
			logger.info(`User disconnected: ${user.id}`);
			onlineUsers.delete(user.id);
			socket.broadcast.emit(SocketEvents.USER_OFFLINE, { userId: user.id });
		});
	});

	// Handle authentication errors
	io.on('connect_error', (err) => {
		logger.error(`Socket connection error: ${err.message}`);
	});

	return io;
};
