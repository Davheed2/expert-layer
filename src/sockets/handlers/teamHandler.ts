import { Server, Socket } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { logger } from '@/common/utils';
import { teamRepository } from '@/repository';

export const teamHandler = (io: Server, socket: Socket) => {
	const user = socket.data.user;

	// Join all team rooms that the user is a member of
	socket.on(SocketEvents.JOIN_ROOM, async (data) => {
		try {
			const { teamId } = data;
			const roomId = `team:${teamId}`;

			console.log('User:', user.id, 'is trying to join team room:', roomId);
			const isMember = await teamRepository.isUserMemberOfTeam(user.id, teamId);
			if (isMember) {
				socket.join(roomId);
				logger.info(`User ${user.id} joined team room ${roomId}`);
			} else {
				socket.emit('error', { message: 'Not authorized to join this team' });
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error(`Error joining team room: ${error.message}`);
			} else {
				logger.error('Error joining team room: An unknown error occurred');
			}
			socket.emit('error', { message: 'Failed to join team room' });
		}
	});

	// Leave a team room
	socket.on(SocketEvents.LEAVE_ROOM, (data) => {
		const { teamId } = data;
		const roomId = `team:${teamId}`;

		socket.leave(roomId);
		logger.info(`User ${user.id} left team room ${roomId}`);
	});

	// Handle team updates (e.g., new member, member left)
	socket.on(SocketEvents.TEAM_UPDATE, (data) => {
		const { teamId, updateType, payload } = data;
		const roomId = `team:${teamId}`;

		// Broadcast to all team members
		io.to(roomId).emit(SocketEvents.TEAM_UPDATE, {
			teamId,
			updateType,
			payload,
			timestamp: new Date(),
		});
	});
};
