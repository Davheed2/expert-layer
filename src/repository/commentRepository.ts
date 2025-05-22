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
}

export const commentRepository = new CommentRepository();
