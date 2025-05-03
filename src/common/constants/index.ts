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
	DRAFT = 'draft',
	ACTIVE = 'active',
}

export enum ServiceCategory {
	DESIGN = 'design',
	DEVELOPMENT = 'development',
	CONTENT = 'content',
	GROWTH = 'growth',
}

export enum ServiceType {
	ONE_OFF = 'one_off',
	RECURRING = 'recurring',
}

export enum ServicePricing {
	STANDARD = 'standard',
	TIMEBASED = 'timebased',
	CREDITS = 'credits',
}

export enum ServiceRequestAllocation {
	FIXEDAMOUNT = 'fixed_amount',
	TOTALCREDITS = 'requests_based_on_total_credits',
}

export enum RequestStatus {
	DRAFT = 'draft',
	FINDING_EXPERT = 'finding_expert',
	IN_PROGRESS = 'in_progress',
	REVIEW = 'review',
	COMPLETED = 'completed',
	BLOCKED = 'blocked'
}

export enum RequestPriority {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	NONE = 'none',
}

export enum CurrencyType {
	USD = 'USD',
	NGN = 'NGN',
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

export enum SocketEvents {
	// Connection events
	CONNECT = 'connect',
	DISCONNECT = 'disconnect',

	// Authentication events
	AUTH_ERROR = 'auth_error',

	// Presence events
	USER_ONLINE = 'user_online',
	USER_OFFLINE = 'user_offline',
	USER_TYPING = 'user_typing',
	USER_STOP_TYPING = 'user_stop_typing',
	ONLINE_USERS = 'online_users',

	// Message events
	SEND_MESSAGE = 'send_message',
	MESSAGE_RECEIVED = 'message_received',
	MESSAGE_READ = 'message_read',
	GET_ROOM_MESSAGES = 'get_room_messages',
	ROOM_MESSAGES = 'room_messages',

	// Room events
	JOIN_ROOM = 'join_room',
	LEAVE_ROOM = 'leave_room',

	// Team events
	TEAM_UPDATE = 'team_update',
	TEAM_MESSAGE = 'team_message',
}

export enum RoomTypes {
	DIRECT = 'direct', // 1-to-1 conversations
	TEAM = 'team', // Team conversations
	GROUP = 'group', // Group conversations (not tied to teams)
}

export enum MessageStatus {
	SENT = 'sent',
	DELIVERED = 'delivered',
	READ = 'read',
}
