import { knexDb } from '@/common/config';
import { IWallet } from '@/common/interfaces';
import { DateTime } from 'luxon';

class WalletRepository {
	create = async (payload: Partial<IWallet>) => {
		return await knexDb.table('wallets').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IWallet | null> => {
		return await knexDb.table('wallets').where({ id }).first();
	};

	findByUserId = async (userId: string): Promise<IWallet[]> => {
		return await knexDb.table('wallets').where({ userId }).select('*');
	};

	update = async (id: string, payload: Partial<IWallet>) => {
		return await knexDb('wallets')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};
}

export const walletRepository = new WalletRepository();
