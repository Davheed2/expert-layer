import { NotificationSource, NotificationType } from '../constants';
import { IUser } from './user';

export interface INotification {
	id: string;
	userId: string;
	fromUserId?: string | null;
	sysNotificationId?: number | null;
	title: string;
	message: string;
	isRead: boolean;
	readAt?: Date | null;
	source: NotificationSource | null;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface IUserNotificationSetting {
	id: string;
	userId: string;
	sysNotificationId: number;
	enabled: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface ISysNotification {
	id: string;
	title: string;
	body: string;
	type: NotificationType;
	source: NotificationSource;
	isUserConfigurable: boolean;
	isActive: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface AddNotificationPayload {
	userId: string;
	fromUserId?: string;
	sysNotificationId?: number;
	title?: string;
	message?: string;
	source?: NotificationSource
}

export interface NotifyOptions {
	users: IUser[];
	fromUserId?: string;
	sysNotificationId: number;
	title?: string;
	message?: string;
	source?: NotificationSource
}
