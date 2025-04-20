import { CurrencyType, TransactionStatus, TransactionType } from '../constants';

export interface ITransaction {
	id: string;
	userId: string;
	taskId: string;
	type: TransactionType;
	walletBalanceBefore: number;
	walletBalanceAfter: number;
	stripePaymentIntentId: string;
	metadata?: Record<string, string | number | boolean>;
	amount: number;
	serviceId: string;
	currency: CurrencyType;
	status: TransactionStatus;
	created_at?: Date;
	updated_at?: Date;
}
