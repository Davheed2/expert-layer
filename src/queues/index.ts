import { startEmailQueue, stopEmailQueue } from './emailQueue';

const startAllQueuesAndWorkers = async () => {
	await startEmailQueue();
};

const stopAllQueuesAndWorkers = async () => {
	await stopEmailQueue();
};

export * from './emailQueue';
export { startAllQueuesAndWorkers, stopAllQueuesAndWorkers };
