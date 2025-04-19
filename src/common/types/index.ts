import { IUser } from '../interfaces';

export type AuthenticateResult = {
	currentUser: IUser;
	accessToken?: string;
};
