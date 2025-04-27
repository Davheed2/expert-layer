import { IUser } from './user';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: IUser;
			realUser?: IUser;
			isImpersonating: boolean;
			file?: Express.Multer.File;
		}
	}
}

export {};
