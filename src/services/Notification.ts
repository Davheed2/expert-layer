import { knexDb } from '@/common/config';
import { NotificationSource } from '@/common/constants';
import { AddNotificationPayload, INotification, NotifyOptions } from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { sysNotificationRepository, notificationSettingsRepository } from '@/repository';



class NotificationService {
	async add(payload: AddNotificationPayload): Promise<INotification> {
		const { userId, fromUserId = null, sysNotificationId = null, title, message, source } = payload;

		let finalTitle = title;
		let finalMessage = message;
		let finalSource = source;

		if (sysNotificationId) {
			const sysNotification = await sysNotificationRepository.findById(sysNotificationId);
			if (!sysNotification) {
				throw new AppError('System notification not found', 404);
			}

			finalTitle = sysNotification.title;
			finalMessage = sysNotification.body;
			finalSource = sysNotification.source;
		}

		const newNotification: Partial<INotification> = {
			userId,
			fromUserId,
			sysNotificationId,
			title: finalTitle,
			message: finalMessage,
			isRead: false,
			source: finalSource,
			isDeleted: false,
			readAt: null,
		};

		const [saved] = await knexDb('notifications').insert(newNotification).returning('*');
		return saved;
	}

	async notifyUsersWithSettings(payload: NotifyOptions) {
		const { users, sysNotificationId, title, message, source } = payload;

		let finalTitle = title;
		let finalMessage = message;
		let finalSource = source;

		const sysNotification = await sysNotificationRepository.findById(sysNotificationId);
		if (!sysNotification) {
			throw new AppError('Notification type not found', 404);
		}
		if (!sysNotification.isActive) {
			console.log('Notification is disabled in system settings');
			return;
		}

		finalTitle = sysNotification.title;
		finalMessage = sysNotification.body;
		finalSource = sysNotification.source;

		for (const user of users) {
			let shouldSend = true;

			if (sysNotification.isUserConfigurable) {
				const userSetting = await notificationSettingsRepository.findByUserAndSysId(
					user.id,
					Number(sysNotification.id)
				);

				if (userSetting && userSetting.enabled === false) {
					shouldSend = false;
				}
			}

			if (shouldSend) {
				await this.add({
					userId: user.id,
					sysNotificationId: Number(sysNotification.id),
					title: finalTitle,
					message: finalMessage,
					source: finalSource as NotificationSource,
				});
			}
		}
	}
}

export const Notification = new NotificationService();
