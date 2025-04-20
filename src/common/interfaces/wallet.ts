import { CurrencyType } from '../constants';

export interface IWallet {
	id: string;
	userId: string;
	balance: number;
	currency: CurrencyType;
    isSuspended: boolean;
    isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
