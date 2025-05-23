import { IActivity } from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { activityRepository } from '@/repository';

class ActivityService {
	async add(payload: Partial<IActivity>): Promise<IActivity[]> {
		const { userId, requestId, activity, activityDescription } = payload;

		if (!userId || !activity || !activityDescription) {
			throw new AppError('Missing activity data', 400);
		}

		const activities = await activityRepository.create({
			userId,
			requestId,
			activity,
            activityDescription,
		});

		return activities;
	}
}

export const Activity = new ActivityService();
