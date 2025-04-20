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

export enum CurrencyType {
	USD = 'USD',
	NGN = 'NGN'
}

export enum TransactionType {
	DEPOSIT = 'deposit',
	WITHDRAWAL = 'withdrawal',
	REFUND = 'refund',
	TASK_PAYMENT = 'task_payment',
	WALLET_CREDIT = 'wallet_credit',


	FAILED = 'failed',
	CHARGEBACK = 'chargeback',
}

export enum TransactionStatus {
	PENDING = 'pending',
	SUCCESS = 'success',
	FAILED = 'failed',
	CANCELLED = 'cancelled',
	PROCESSING = 'processing',
}