import { IUser } from './user';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: IUser;
			file?: Express.Multer.File;
		}
	}
}

export {};
