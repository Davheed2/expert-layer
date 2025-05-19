import { knexDb } from '@/common/config';
import { ITransaction } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TransactionRepository {
	create = async (payload: Partial<ITransaction>) => {
		return await knexDb.table('transactions').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<ITransaction | null> => {
		return await knexDb.table('transactions').where({ id }).first();
	};

	findByUserId = async (userId: string): Promise<ITransaction[]> => {
		return await knexDb.table('transactions').where({ userId }).orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<ITransaction>): Promise<ITransaction[]> => {
		return await knexDb('transactions')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};
}

export const transactionRepository = new TransactionRepository();
