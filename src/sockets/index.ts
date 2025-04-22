import { Server as SocketIOServer } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { messageHandler } from './handlers/messageHandler';
import { presenceHandler } from './handlers/presenceHandler';
import { teamHandler } from './handlers/teamHandler';
import { logger } from '@/common/utils';

// Global map to track online users
export const onlineUsers = new Map();

export const initSocketHandlers = (io: SocketIOServer) => {
	io.on(SocketEvents.CONNECT, (socket) => {
		const user = socket.data.user;

		logger.info(`User connected: ${user.id}`);

		// Add user to online users map
		onlineUsers.set(user.id, {
			socketId: socket.id,
			lastSeen: new Date(),
		});

		// Notify others that user is online
		socket.broadcast.emit(SocketEvents.USER_ONLINE, { userId: user.id });

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
