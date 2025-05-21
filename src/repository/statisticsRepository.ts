import { knexDb } from '@/common/config';
import { Statistics } from '@/common/interfaces';

class StatisticsRepository {
	findStats = async (startDate?: Date, endDate?: Date): Promise<Statistics> => {
		const newClients = await knexDb('users')
			.where({ isDeleted: false })
			.modify((queryBuilder) => {
				if (startDate) queryBuilder.where('created_at', '>=', startDate);
				if (endDate) queryBuilder.where('created_at', '<=', endDate);
			})
			.count('* as count')
			.first();

		const totalClients = await knexDb('users').where({ isDeleted: false }).count('* as count').first();

		const growthRate =
			totalClients && Number(totalClients.count) ? (Number(newClients?.count) / Number(totalClients.count)) * 100 : 0;
		const activeRequests = await knexDb('requests')
			.where({ isDeleted: false })
			.whereIn('status', ['in_progress', 'review', 'finding_expert'])
			.modify((queryBuilder) => {
				if (startDate) queryBuilder.where('created_at', '>=', startDate);
				if (endDate) queryBuilder.where('created_at', '<=', endDate);
			})
			.count('* as count')
			.first();
		const totalRevenue = await knexDb('transactions')
			.where({ type: 'credit' })
			.modify((queryBuilder) => {
				if (startDate) queryBuilder.where('created_at', '>=', startDate);
				if (endDate) queryBuilder.where('created_at', '<=', endDate);
			})
			.sum('amount as total')
			.first();

		return {
			totalRevenue: Number(totalRevenue?.total) || 0,
			newClients: Number(newClients?.count) || 0,
			activeRequests: Number(activeRequests?.count) || 0,
			growthRate,
		};
	};
}

export const statisticsRepository = new StatisticsRepository();
