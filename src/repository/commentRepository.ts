import { knexDb } from '@/common/config';
import { IComment } from '@/common/interfaces';
import { DateTime } from 'luxon';

class CommentRepository {
	create = async (payload: Partial<IComment>) => {
		return await knexDb.table('request_comments').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IComment | null> => {
		return await knexDb.table('request_comments').where({ id }).first();
	};

	findByUserId = async (userId: string): Promise<IComment[]> => {
		return await knexDb.table('request_comments').where({ userId }).select('*');
	};

	update = async (id: string, payload: Partial<IComment>) => {
		return await knexDb('request_comments')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	getByRequestId = async (requestId: string): Promise<IComment[]> => {
		const comments = await knexDb
			.table('request_comments')
			.where({ requestId, isDeleted: false })
			.select('id', 'userId', 'comment', 'created_at');

		const commentsWithUser = await Promise.all(
			comments.map(async (com) => {
				const user = await knexDb
					.table('users')
					.where({ id: com.userId })
					.select('id', 'firstName', 'lastName', 'photo')
					.first();
				return { ...com, user };
			})
		);

		return commentsWithUser;
	};
}

export const commentRepository = new CommentRepository();
