import { knexDb } from '@/common/config';
import { logger } from '@/common/utils';
import { Knex } from 'knex';

// Save a new message to the database
export const saveMessage = async ({ senderId, recipientId, content, teamId, roomId, roomType }) => {
	try {
		const [message] = await knexDb('messages')
			.insert({
				sender_id: senderId,
				recipient_id: recipientId,
				content,
				team_id: teamId,
				room_id: roomId,
				room_type: roomType,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning('*');

		return formatMessage(message);
	} catch (error) {
		logger.error(`Error saving message: ${(error as Error).message}`);
		throw error;
	}
};

// Mark a message as read
export const markMessageAsRead = async (messageId, userId) => {
	try {
		// First check if this user is the intended recipient
		const message = await knexDb('messages')
			.where('id', messageId)
			.andWhere(function () {
				this.where('recipient_id', userId).orWhere('team_id', function (this: Knex.QueryBuilder) {
					// Check if user is part of this team
					this.select(1)
						.from('team_members')
						.where('user_id', userId)
						.whereRaw('team_members.team_id = messages.team_id');
				});
			})
			.first();

		if (!message) {
			throw new Error('Message not found or user is not the recipient');
		}

		// Create a read receipt
		await knexDb('message_read_receipts')
			.insert({
				message_id: messageId,
				user_id: userId,
				read_at: new Date(),
			})
			.onConflict(['message_id', 'user_id'])
			.merge({ read_at: new Date() });

		return true;
	} catch (error) {
		logger.error(`Error marking message as read: ${(error as Error).message}`);
		throw error;
	}
};

// Get messages for a specific room
export const getMessagesByRoomId = async (roomId, limit = 50, offset = 0) => {
	try {
		const messages = await knexDb('messages')
			.where('room_id', roomId)
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset);

		return messages.map(formatMessage);
	} catch (error) {
		logger.error(`Error fetching messages: ${(error as Error).message}`);
		throw error;
	}
};

// Get unread message count for a user
export const getUnreadMessageCount = async (userId) => {
	try {
		// Get direct messages count
		const directCount = await knexDb('messages')
			.where('recipient_id', userId)
			.whereNotExists(function () {
				this.select(1)
					.from('message_read_receipts')
					.where('user_id', userId)
					.whereRaw('message_read_receipts.message_id = messages.id');
			})
			.count('* as count')
			.first();

		// Get team messages count
		const teamCount = await knexDb('messages')
			.whereIn('team_id', function () {
				this.select('team_id').from('team_members').where('user_id', userId);
			})
			.whereNotExists(function () {
				this.select(1)
					.from('message_read_receipts')
					.where('user_id', userId)
					.whereRaw('message_read_receipts.message_id = messages.id');
			})
			.whereNot('sender_id', userId) // Don't count user's own messages
			.count('* as count')
			.first();

		return {
			direct: parseInt((directCount?.count || 0).toString()),
			team: parseInt((teamCount?.count || 0).toString()),
			total: parseInt((directCount?.count || 0).toString()) + parseInt((teamCount?.count || 0).toString()),
		};
	} catch (error) {
		logger.error(`Error fetching unread count: ${(error as Error).message}`);
		throw error;
	}
};

// Helper function to transform database records to camelCase
interface Message {
	id: number;
	sender_id: number;
	recipient_id: number | null;
	content: string;
	team_id: number | null;
	room_id: number;
	room_type: string;
	created_at: Date;
	updated_at: Date;
}

interface FormattedMessage {
	id: number;
	senderId: number;
	recipientId: number | null;
	content: string;
	teamId: number | null;
	roomId: number;
	roomType: string;
	createdAt: Date;
	updatedAt: Date;
}

const formatMessage = (message: Message): FormattedMessage => {
	return {
		id: message.id,
		senderId: message.sender_id,
		recipientId: message.recipient_id,
		content: message.content,
		teamId: message.team_id,
		roomId: message.room_id,
		roomType: message.room_type,
		createdAt: message.created_at,
		updatedAt: message.updated_at,
	};
};
