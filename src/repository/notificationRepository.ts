import { knexDb } from '@/common/config';
import { INotification } from '@/common/interfaces';
import { DateTime } from 'luxon';

class NotificationRepository {
	create = async (payload: Partial<INotification>) => {
		return await knexDb.table('notifications').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<INotification | null> => {
		return await knexDb.table('notifications').where({ id }).first();
	};

	findForUser = async (userId: string): Promise<INotification[] | null> => {
		return await knexDb.table('notifications').where({ userId, isDeleted: false }).orderBy('created_at', 'desc');
	};

	findUnreadForUser = async (userId: string): Promise<INotification[] | null> => {
		return await knexDb
			.table('notifications')
			.where({ userId: userId, isRead: false, isDeleted: false })
			.orderBy('created_at', 'desc');
	};

	markAsRead = async (id: string) => {
		return await knexDb('notifications')
			.where({ id })
			.update({ isRead: true, readAt: DateTime.now().toJSDate(), updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	markAllAsReadForUser = async (userId: string) => {
		return await knexDb('notifications')
			.where({ userId, isRead: false })
			.update({ isRead: true, readAt: DateTime.now().toJSDate(), updated_at: DateTime.now().toJSDate() });
	};

	softDelete = async (id: string) => {
		return await knexDb('notifications')
			.where({ id })
			.update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};
}

export const notificationRepository = new NotificationRepository();
