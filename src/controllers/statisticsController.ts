import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { statisticsRepository } from '@/repository';

export class StatisticsController {
	findStats = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { startDate, endDate } = req.query;
		const start = startDate ? new Date(startDate as string) : undefined;
		const end = endDate ? new Date(endDate as string) : undefined;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('Unauthorized access', 400);
		}
		if (start && end && start > end) {
			throw new AppError('Start date cannot be greater than end date', 400);
		}

		const statistics = await statisticsRepository.findStats(start, end);
		if (!statistics) {
			throw new AppError('No statistics found', 404);
		}

		return AppResponse(res, 200, toJSON([statistics]), 'Stats fetched successfully');
	});
}

export const statisticsController = new StatisticsController();
