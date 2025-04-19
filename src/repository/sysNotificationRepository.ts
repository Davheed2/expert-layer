import { knexDb } from '@/common/config';
import { ISysNotification } from '@/common/interfaces';
import { DateTime } from 'luxon';

class SysNotificationRepository {
	create = async (payload: Partial<ISysNotification>) => {
		return await knexDb.table('sys_notifications').insert(payload).returning('*');
	};

	findById = async (id: number): Promise<ISysNotification | null> => {
		return await knexDb.table('sys_notifications').where({ id }).first();
	};

	findByTitle = async (title: string): Promise<ISysNotification | null> => {
		return await knexDb.table('sys_notifications').where({ title }).first();
	};

	findByBody = async (body: string): Promise<ISysNotification | null> => {
		return await knexDb.table('sys_notifications').where({ body }).first();
	};

	findByCode = async (code: string): Promise<ISysNotification | null> => {
		return await knexDb.table('sys_notifications').where({ code }).first();
	};

	update = async (id: string, payload: Partial<ISysNotification>) => {
		return await knexDb('sys_notifications')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	delete = async (id: string) => {
		return await knexDb('sys_notifications').where({ id }).delete();
	};

	findAll = async () => {
		return await knexDb.table('sys_notifications').orderBy('created_at', 'desc');
	};

	findAllConfigurable = async () => {
		return await knexDb.table('sys_notifications').where({ isUserConfigurable: true }).orderBy('created_at', 'desc');
	};
}

export const sysNotificationRepository = new SysNotificationRepository();
