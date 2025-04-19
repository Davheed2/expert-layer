import IORedis from 'ioredis';
import { ENVIRONMENT } from './environment';

let redisClient: IORedis;
export const connectRedis = async (): Promise<void> => {
	try {
		redisClient = new IORedis({
			port: ENVIRONMENT.REDIS.PORT,
			host: ENVIRONMENT.REDIS.URL,
			password: ENVIRONMENT.REDIS.PASSWORD,
			maxRetriesPerRequest: null,
			enableOfflineQueue: false,
			offlineQueue: false,
		});

		redisClient.on('connect', () => {
			console.log('Redis cluster connected');
		});

		redisClient.on('error', (error) => {
			console.error('Redis connection error:', error.message);
			process.exit(1);
		});
	} catch (error) {
		console.log('Error connecting to Redis cluster: ' + (error as Error).message);
		process.exit(1);
	}
};

export const disconnectRedis = async (): Promise<void> => {
	try {
		if (redisClient) {
			await redisClient.quit();
			console.log('Redis disconnected');
		}
	} catch (error) {
		console.log('Error disconnecting from Redis: ' + (error as Error).message);
		process.exit(1);
	}
};

export { redisClient };
