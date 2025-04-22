import { Server, Socket } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { onlineUsers } from '../index';

export const presenceHandler = (io: Server, socket: Socket) => {
	const user = socket.data.user;

	// Send list of online users when a user connects
	const onlineUsersList = Array.from(onlineUsers.keys()).map((userId) => ({ userId }));
	socket.emit('online_users', { users: onlineUsersList });

	// Update user's last seen timestamp periodically
	const updateLastSeen = setInterval(() => {
		if (onlineUsers.has(user.id)) {
			onlineUsers.set(user.id, {
				...onlineUsers.get(user.id),
				lastSeen: new Date(),
			});
		}
	}, 60000); // Update every minute

	// Clean up on disconnect
	socket.on(SocketEvents.DISCONNECT, () => {
		clearInterval(updateLastSeen);
	});
};
