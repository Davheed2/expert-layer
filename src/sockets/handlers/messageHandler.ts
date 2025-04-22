import { Server, Socket } from 'socket.io';
import { SocketEvents, RoomTypes } from '@/common/constants';
import { saveMessage, markMessageAsRead } from '../services/messageService';
import { getRoomId } from '../services/roomService';
import { logger } from '@/common/utils';
import { messageRepository } from '@/repository';

export const messageHandler = (io: Server, socket: Socket) => {
	const user = socket.data.user;

	// Handle sending a message
	socket.on(SocketEvents.SEND_MESSAGE, async (data) => {
		try {
			const { recipientId, content, teamId } = data;

			// Determine room type and ID
			let roomType = RoomTypes.DIRECT;
			let roomId;

			if (teamId) {
				roomType = RoomTypes.TEAM;
				roomId = `team:${teamId}`;

				// Auto-join team room if needed
				socket.join(roomId);
			} else {
				roomId = getRoomId(user.id, recipientId);
			}

			// Save message to database
			const message = await saveMessage({
				senderId: user.id,
				recipientId,
				content,
				teamId,
				roomId,
				roomType,
			});

			// Emit to room
			io.to(roomId).emit(SocketEvents.MESSAGE_RECEIVED, message);

			// If it's a direct message, also send to the specific recipient if they're not in the room
			if (roomType === RoomTypes.DIRECT) {
				const recipientSocket = Array.from(io.sockets.sockets.values()).find((s) => s.data.user?.id === recipientId);

				if (recipientSocket && !recipientSocket.rooms.has(roomId)) {
					recipientSocket.emit(SocketEvents.MESSAGE_RECEIVED, message);
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error(`Error sending message: ${error.message}`);
			} else {
				logger.error('Error sending message: An unknown error occurred');
			}
			socket.emit('error', { message: 'Failed to send message' });
		}
	});

	// Handle marking messages as read
	socket.on(SocketEvents.MESSAGE_READ, async (data) => {
		try {
			const { messageId } = data;

			await markMessageAsRead(messageId, user.id);

			// Get the original message to notify the sender
			const message = await getMessageById(messageId);
			if (message) {
				// Notify the sender that their message was read
				io.to(message.sender_id).emit(SocketEvents.MESSAGE_READ, {
					messageId,
					readBy: user.id,
					readAt: new Date(),
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				logger.error(`Error marking message as read: ${error.message}`);
			} else {
				logger.error('Error marking message as read: An unknown error occurred');
			}
			socket.emit('error', { message: 'Failed to mark message as read' });
		}
	});

	// Handle user typing indicator
	socket.on(SocketEvents.USER_TYPING, (data) => {
		const { recipientId, teamId } = data;

		let roomId;
		if (teamId) {
			roomId = `team:${teamId}`;
		} else {
			roomId = getRoomId(user.id, recipientId);
		}

		socket.to(roomId).emit(SocketEvents.USER_TYPING, { userId: user.id });
	});

	socket.on(SocketEvents.USER_STOP_TYPING, (data) => {
		const { recipientId, teamId } = data;

		let roomId: string;
		if (teamId) {
			roomId = `team:${teamId}`;
		} else {
			roomId = getRoomId(user.id, recipientId);
		}

		socket.to(roomId).emit(SocketEvents.USER_STOP_TYPING, { userId: user.id });
	});
};

// Helper function to get message by ID (you'll implement this)
const getMessageById = async (messageId) => {
	// Implement database retrieval
	return messageRepository.findById(messageId);
};
