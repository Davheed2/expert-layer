export interface IVirtualAccount {
	id: string;
	userId: string;
    walletId: string;
    currency: string; // e.g., "USD", "EUR"
    accountNumber: string; // e.g., "1234567890"
    accountName: string; // e.g., "John Doe"
    bankName: string; // e.g., "Bank of America"
    customerId: string; // e.g., "CUST123456"
    customerCode: string; // e.g., "CUSTCODE123"
	created_at?: Date;
	updated_at?: Date;
}