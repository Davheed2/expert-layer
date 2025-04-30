import { Server, Socket } from 'socket.io';
import { SocketEvents, RoomTypes } from '@/common/constants';
import { saveMessage, markMessageAsRead } from '../services/messageService';
import { getRoomConversations, getRoomId } from '../services/roomService';
import { logger } from '@/common/utils';
import { messageRepository } from '@/repository';

export const messageHandler = (io: Server, socket: Socket) => {
	const user = socket.data.user;

	// Handle sending a message
	socket.on(SocketEvents.SEND_MESSAGE, async (data) => {
		try {
			const { content, recipientId, teamId } = data;

			let roomId: string;
			let roomType: RoomTypes;

			if (teamId) {
				// Group chat logic
				roomType = RoomTypes.TEAM;
				roomId = `team:${teamId}`;

				socket.join(roomId);
				// Save and emit
				const message = await saveMessage({
					senderId: user.id,
					content,
					roomId,
					roomType,
					teamId,
					recipientId: null,
				});

				io.to(roomId).emit(SocketEvents.MESSAGE_RECEIVED, message);
			} else if (recipientId) {
				// Direct message logic
				roomType = RoomTypes.DIRECT;
				roomId = getRoomId(user.id, recipientId);

				const message = await saveMessage({
					senderId: user.id,
					recipientId,
					content,
					roomId,
					roomType,
					teamId: null,
				});

				io.to(roomId).emit(SocketEvents.MESSAGE_RECEIVED, message);

				// Optionally emit to individual if not in room
				const recipientSocket = Array.from(io.sockets.sockets.values()).find((s) => s.data.user?.id === recipientId);

				if (recipientSocket && !recipientSocket.rooms.has(roomId)) {
					recipientSocket.emit(SocketEvents.MESSAGE_RECEIVED, message);
				}
			} else {
				throw new Error('Invalid message payload: either teamId or recipientId is required');
			}
		} catch (error) {
			logger.error(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
			socket.emit('error', { message: 'Failed to send message' });
		}
	});

	socket.on(SocketEvents.GET_ROOM_MESSAGES, async ({ roomId }) => {
		try {
			const messages = await getRoomConversations(roomId);
			socket.emit(SocketEvents.ROOM_MESSAGES, { roomId, messages });
		} catch (err) {
			console.error('Failed to fetch room messages:', err);
			socket.emit('error', { message: 'Failed to fetch messages.' });
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

		let roomId: string;
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

const getMessageById = async (messageId: string) => {
	return messageRepository.findById(messageId);
};
