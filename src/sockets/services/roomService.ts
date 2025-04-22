import { knexDb } from '@/common/config';
import { logger } from '@/common/utils';
import { RoomTypes } from '@/common/constants';

// Generate a consistent room ID for direct messages
export const getRoomId = (userId1, userId2) => {
	// Ensure consistent ordering regardless of who initiates
	const sortedIds = [userId1, userId2].sort();
	return `direct:${sortedIds[0]}:${sortedIds[1]}`;
};

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
					metadata: JSON.stringify(metadata),
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning('*');
		}

		return {
			id: room.id,
			roomId: room.room_id,
			roomType: room.room_type,
			metadata: JSON.parse(room.metadata || '{}'),
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

// Additional function in roomService.ts
export const getClientManagerRoomId = async (clientId, managerId, teamId) => {
	// This creates a unique room ID for a specific client-manager pair within a team
	return `team:${teamId}:client:${clientId}:manager:${managerId}`;
};

// Function to initialize rooms when a manager is assigned to a client
export const initializeClientManagerRoom = async (clientId, managerId, teamId) => {
	const roomId = getClientManagerRoomId(clientId, managerId, teamId);

	// Create room if it doesn't exist
	return getOrCreateRoom(roomId, RoomTypes.DIRECT, {
		clientId,
		managerId,
		teamId,
		roomType: 'client-manager',
	});
};
