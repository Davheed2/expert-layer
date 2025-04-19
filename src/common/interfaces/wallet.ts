export interface IWallet {
	id: string;
	userId: string;
    balance: number; // positive for funding, negative for deductions
    currency: string; // e.g., "USD", "EUR"
	created_at?: Date;
	updated_at?: Date;
}

export interface IWalletTransaction {
	id: string;
	userId: string;
    walletId: string;
    type: string; // e.g., "credit", "debit"
    initType: string; // e.g., "wallet", "card"
    currency: string; // e.g., "USD", "EUR"
    reference: string; 
    status: string; // e.g., "pending", "completed", "failed"
    fees: number; // fees associated with the transaction
    totalAmount: number; // total amount after fees
    description: string; // description of the transaction
	created_at?: Date;
	updated_at?: Date;
}