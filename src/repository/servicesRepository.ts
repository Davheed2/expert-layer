import { knexDb } from '@/common/config';
import { IService } from '@/common/interfaces';
import { DateTime } from 'luxon';

class ServicesRepository {
	create = async (payload: Partial<IService>) => {
		return await knexDb.table('services').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IService | null> => {
		return await knexDb.table('services').where({ id }).first();
	};

	findByTaskId = async (taskId: string): Promise<IService | null> => {
		return await knexDb.table('services').where({ taskId }).first();
	};

	findByUserId = async (userId: string): Promise<IService | null> => {
		return await knexDb.table('services').where({ userId, isDeleted: false }).first();
	};

	update = async (id: string, payload: Partial<IService>) => {
		return await knexDb('services')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	softDelete = async (id: string) => {
		return await knexDb('services').where({ id }).update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};

	findAll = async (): Promise<IService[]> => {
		return await knexDb.table('services').where({ isDeleted: false }).orderBy('created_at', 'desc');
	};
}

export const servicesRepository = new ServicesRepository();
