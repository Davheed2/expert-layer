import { knexDb } from '@/common/config';
import { IUserNotificationSetting } from '@/common/interfaces';
import { DateTime } from 'luxon';

class NotificationSettingsRepository {
	create = async (payload: Partial<IUserNotificationSetting>) => {
		return await knexDb.table('user_notification_settings').insert(payload).returning('*');
	};

	findByUserId = async (userId: string): Promise<IUserNotificationSetting | null> => {
		return await knexDb.table('user_notification_settings').where({ userId }).first();
	};

	updateByUserId = async (userId: string, payload: Partial<IUserNotificationSetting>) => {
		return await knexDb('user_notification_settings')
			.where({ userId })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	findByUserAndSysId = async (userId: string, sysNotificationId: number): Promise<IUserNotificationSetting | null> => {
		return await knexDb
			.table('user_notification_settings')
			.where({
				userId,
				sysNotificationId,
			})
			.first();
	};

	upsertUserNotificationSetting = async (
		userId: string,
		sysNotificationId: number,
		enabled: boolean
	): Promise<IUserNotificationSetting[]> => {
		const existingSetting = await knexDb('user_notification_settings').where({ userId, sysNotificationId }).first();

		if (existingSetting) {
			return knexDb('user_notification_settings').where({ id: existingSetting.id }).update({
				enabled,
				updated_at: knexDb.fn.now(),
			});
		} else {
			return this.create({
				userId,
				sysNotificationId,
				enabled,
			});
		}
	};

	deleteByUserId = async (userId: string) => {
		return await knexDb('user_notification_settings').where({ userId }).delete();
	};
}

export const notificationSettingsRepository = new NotificationSettingsRepository();
