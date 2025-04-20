/**
 * App wide constants go here
 *
 * e.g
 * export const APP_NAME = 'MyApp';
 */
export enum Role {
	CLIENT = 'client',
	TALENT = 'talent',
	ACCOUNTMANAGER = 'accountmanager',
	ADMIN = 'admin',
}

export enum NotificationType {
	EMAIL = 'email',
	SMS = 'sms',
	PUSH = 'push',
	INAPP = 'inApp',
}

export enum NotificationSource {
	CLIENT = 'client',
	TEAM = 'team',
	SYSTEM = 'system',
}

export enum ServiceStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	INPROGRESS = 'inprogress',
	CANCELLED = 'cancelled',
	PAID = 'paid',
}

export enum ServiceType {
	ONE_TIME = 'onetime',
	SUBSCRIPTION = 'subscription',
}
