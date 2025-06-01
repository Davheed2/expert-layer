import { Role } from '../constants';

export interface IUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string | null;
	ipAddress: string;
	photo: string;
	role: Role;
	passwordResetRetries: number;
	passwordResetToken: string;
	passwordResetExpires: Date;
	passwordChangedAt: Date;
	loginRetries: number;
	lastLogin: Date;
	isSuspended: boolean;
	isEmailVerified: boolean;
	verificationToken: string | null;
	verificationTokenExpires: Date | null;
	tokenIsUsed: boolean;
	loginToken: string | null;
	loginTokenExpires: Date | null;
	referralCode: string;
	stripe_customer_id: string
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
