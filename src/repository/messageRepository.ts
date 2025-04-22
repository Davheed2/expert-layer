import { knexDb } from '@/common/config';
import { IMessage } from '@/common/interfaces';
// import { DateTime } from 'luxon';

class MessageRepository {
	create = async (payload: Partial<IMessage>) => {
		return await knexDb.table('messages').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IMessage | null> => {
		return await knexDb.table('messages').where({ id }).first();
	};

	markAsRead = async (messageId: string, userId: string) => {
		return await knexDb('message_read_receipts')
			.insert({
				message_id: messageId,
				user_id: userId,
				read_at: new Date(),
			})
			.onConflict(['message_id', 'user_id'])
			.merge({ read_at: new Date() });
	};

	getMessagesByRoomId = async (roomId: string, limit: number, offset: number) => {
		return await knexDb('messages').where('room_id', roomId).orderBy('created_at', 'desc').limit(limit).offset(offset);
	};

	getUnreadCountForUser = async (userId: string) => {
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

		const teamManagers = await knexDb.raw(
			`
                SELECT COUNT(*) as count
                FROM messages m
                JOIN teams t ON m.team_id = t.id
                WHERE 
                  t.owner_id = ?
                  AND m.sender_id != ?
                  AND NOT EXISTS (
                    SELECT 1 FROM message_read_receipts 
                    WHERE message_id = m.id AND user_id = ?
                  )
              `,
			[userId, userId, userId]
		);

		return {
			direct: parseInt((directCount?.count || 0).toString()),
			teamManager: parseInt(teamManagers.rows[0].count.toString()),
			total: parseInt((directCount?.count ?? 0).toString()) + parseInt(teamManagers.rows[0].count.toString()),
		};
	};
}

export const messageRepository = new MessageRepository();
