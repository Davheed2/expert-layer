import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { activityRepository } from '@/repository';

export class ActivityController {
	findByRequestId = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const activity = await activityRepository.getByRequestId(requestId as string);
		if (!activity) throw new AppError('No activity Found', 404);

		return AppResponse(res, 200, toJSON(activity), 'Activity retrieved successfully', req);
	});
}

export const activityController = new ActivityController();
