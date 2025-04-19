// export interface IOrder {
// 	id: string;
// 	totalAmount: number;
// 	duration: string;
// 	created_at?: Date;
// 	updated_at?: Date;
// }

// types/order.ts

export interface OrderItem {
	description: string;
	amount: number; // positive for funding, negative for deductions
}

export interface DeliveryOption {
	type: string;
	duration: string;
	included: boolean;
}

export interface OrderSummary {
	items: OrderItem[];
	delivery?: DeliveryOption;
	total: number;
	remainingBalance?: number; // optional: shown only in account-based summaries
}
