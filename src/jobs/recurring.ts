import cron from 'node-cron';
import { processRecurringWalletTopUps } from './recurringWalletTopups';

// Schedule: Runs every day at 00:00 (midnight)
cron.schedule('0 0 * * *', async () => {
	// cron.schedule('* * * * *', async () => {
	console.log('Running recurring wallet top-up job');
	try {
		await processRecurringWalletTopUps();
		console.log('Recurring wallet top-up job completed successfully.');
	} catch (error) {
		console.error('Recurring wallet top-up job failed:', error);
	}
});
