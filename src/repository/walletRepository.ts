import { knexDb } from '@/common/config';
import { IWallet } from '@/common/interfaces';

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
}

export const walletRepository = new WalletRepository();
