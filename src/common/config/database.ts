import knex, { Knex } from 'knex';
import { ENVIRONMENT } from './environment';

export const knexConfig: Knex.Config = {
	client: 'pg',
	connection: {
		host: ENVIRONMENT.DB.HOST,
		user: ENVIRONMENT.DB.USER,
		password: ENVIRONMENT.DB.PASSWORD,
		database: ENVIRONMENT.DB.DATABASE,
		port: ENVIRONMENT.DB.PORT ? parseInt(ENVIRONMENT.DB.PORT, 10) : 5432,
		//ssl: ENVIRONMENT.DB.SSL ? { rejectUnauthorized: false } : false,
		...(ENVIRONMENT.APP.ENV === 'production' ? { ssl: { rejectUnauthorized: true } } : {}),
	},
	pool: { min: 1, max: 5, idleTimeoutMillis: 600000, propagateCreateError: false },
	migrations: {
		tableName: 'knex_migrations',
		directory: process.env.NODE_ENV === 'production' ? './migrations' : './migrations',
		extension: process.env.NODE_ENV === 'production' ? 'js' : 'ts',
	},
	acquireConnectionTimeout: 5000,
};

export const knexDb = knex(knexConfig);

const DB_NAME = ENVIRONMENT.DB.DATABASE;
export const connectDb = async (): Promise<void> => {
	try {
		await knexDb.raw('SELECT 1');
		console.log(`Database connected successfully to ${DB_NAME}`);
	} catch (error) {
		console.error('Error connecting to the database: ' + (error as Error).message);
		process.exit(1);
	}
};

export const disconnectDb = async (): Promise<void> => {
	try {
		await knexDb.destroy();
		console.log('Database connection closed');
	} catch (error) {
		console.error('Error closing the database: ' + (error as Error).message);
		process.exit(1);
	}
};
