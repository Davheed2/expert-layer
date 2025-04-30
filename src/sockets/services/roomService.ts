import { knexDb } from '@/common/config';
import { logger } from '@/common/utils';
import { RoomTypes } from '@/common/constants';

// Generate a consistent room ID for direct messages
export const getRoomId = (userId1, userId2) => {
	// Ensure consistent ordering regardless of who initiates
	const sortedIds = [userId1, userId2].sort();
	return `direct:${sortedIds[0]}:${sortedIds[1]}`;
};

function sanitizeMetadata(metadata) {
	const sanitized = { ...metadata };
	for (const key in sanitized) {
		if (sanitized[key] instanceof Date) {
			sanitized[key] = sanitized[key].toISOString();
		}
	}
	return sanitized;
}

// Get or create a room
export const getOrCreateRoom = async (roomId, roomType, metadata = {}) => {
	try {
		// Check if room exists
		let room = await knexDb('chat_rooms').where('room_id', roomId).first();

		if (!room) {
			// Create a new room
			[room] = await knexDb('chat_rooms')
				.insert({
					room_id: roomId,
					room_type: roomType,
					metadata: sanitizeMetadata(metadata),
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*');
		}

		return {
			id: room.id,
			roomId: room.room_id,
			roomType: room.room_type,
			metadata: sanitizeMetadata(room.metadata),
			createdAt: room.created_at,
			updatedAt: room.updated_at,
		};
	} catch (error) {
		logger.error(`Error in room service: ${(error as Error).message}`);
		throw error;
	}
};

// Get user's recent conversations
export const getUserConversations = async (userId) => {
	try {
		// Get direct conversations
		const directRooms = await knexDb.raw(
			`
      SELECT 
        DISTINCT ON (m.room_id) m.room_id,
        m.content as last_message,
        m.created_at as last_message_time,
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        u.name as other_user_name,
        u.profile_image as other_user_image,
        (
          SELECT COUNT(*) FROM messages 
          WHERE room_id = m.room_id 
          AND recipient_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM message_read_receipts 
            WHERE message_id = messages.id AND user_id = ?
          )
        ) as unread_count
      FROM messages m
      JOIN users u ON 
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id = u.id
          ELSE m.sender_id = u.id
        END
      WHERE 
        (m.sender_id = ? OR m.recipient_id = ?)
        AND m.room_type = ?
      ORDER BY m.room_id, m.created_at DESC
    `,
			[userId, userId, userId, userId, userId, userId, RoomTypes.DIRECT]
		);

		// Get team conversations
		const teamRooms = await knexDb.raw(
			`
      SELECT 
        DISTINCT ON (m.room_id) m.room_id,
        m.content as last_message,
        m.created_at as last_message_time,
        m.team_id,
        t.name as team_name,
        t.image as team_image,
        (
          SELECT COUNT(*) FROM messages 
          WHERE team_id = m.team_id 
          AND sender_id != ?
          AND NOT EXISTS (
            SELECT 1 FROM message_read_receipts 
            WHERE message_id = messages.id AND user_id = ?
          )
        ) as unread_count
      FROM messages m
      JOIN teams t ON m.team_id = t.id
      JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = ?
      WHERE m.room_type = ?
      ORDER BY m.room_id, m.created_at DESC
    `,
			[userId, userId, userId, RoomTypes.TEAM]
		);

		return {
			direct: directRooms.rows,
			teams: teamRooms.rows,
		};
	} catch (error) {
		logger.error(`Error fetching conversations: ${(error as Error).message}`);
		throw error;
	}
};

export const getUserConversation = async (userId: string) => {
	try {
		const baseSelect = (isSent: boolean) =>
			knexDb('messages as m')
				.select(
					'm.room_id',
					'm.content as last_message',
					'm.created_at as last_message_time',
					isSent ? 'm.recipient_id as other_user_id' : 'm.sender_id as other_user_id',
					'u.first_name as other_user_first_name',
					'u.last_name as other_user_last_name',
					'u.profile_image as other_user_image',
					knexDb.raw(
						`(
              SELECT COUNT(*) FROM messages 
              WHERE room_id = m.room_id 
                AND recipient_id = ? 
                AND NOT EXISTS (
                  SELECT 1 FROM message_read_receipts 
                  WHERE message_id = messages.id AND user_id = ?
                )
            ) as unread_count`,
						[userId, userId]
					),
					knexDb.raw('ROW_NUMBER() OVER (PARTITION BY m.room_id ORDER BY m.created_at DESC) as rn')
				)
				.join('users as u', isSent ? 'u.id' : 'm.sender_id', isSent ? 'm.recipient_id' : 'u.id')
				.where(isSent ? 'm.sender_id' : 'm.recipient_id', userId)
				.andWhere('m.room_type', RoomTypes.DIRECT);

		const subquerySent = baseSelect(true);
		const subqueryReceived = baseSelect(false);

		// Union both and return latest message per room
		const directRooms = await knexDb
			.select('*')
			.from(knexDb.raw('(?) as all_conversations', [knexDb.unionAll([subquerySent, subqueryReceived], true)]))
			.where('rn', 1);

		return directRooms;
	} catch (error) {
		throw new Error('Failed to fetch room conversations: ' + (error as Error).message);
	}
};

export const getRoomConversations = async (roomId: string) => {
	const messages = await knexDb('messages')
		.select(
			'messages.id',
			'messages.content',
			'messages.created_at',
			'messages.sender_id',
			'users.first_name as senderFirstName',
			'users.last_name as senderLastName',
			'users.profile_image as senderProfileImage'
		)
		.leftJoin('users', 'messages.sender_id', 'users.id')
		.where('messages.room_id', roomId)
		.orderBy('messages.created_at', 'asc');

	return messages;
};

// Additional function in roomService.ts
export const getClientManagerRoomId = (teamId: string): string => {
	// This creates a unique room ID for a specific client-manager pair within a team
	return `team:${teamId}`;
};

// Function to initialize rooms when a manager is assigned to a client
export const initializeClientManagerRoom = async (clientId, managerId, teamId) => {
	const roomId = getClientManagerRoomId(teamId);

	// Create room if it doesn't exist
	return getOrCreateRoom(roomId, RoomTypes.DIRECT, {
		clientId,
		managerId,
		teamId,
		roomType: 'client-manager',
	});
};
