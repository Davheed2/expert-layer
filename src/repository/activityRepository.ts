import { knexDb } from '@/common/config';
import { IActivity } from '@/common/interfaces';
import { DateTime } from 'luxon';

class ActivityRepository {
	create = async (payload: Partial<IActivity>) => {
		return await knexDb.table('activities').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IActivity | null> => {
		return await knexDb.table('activities').where({ id }).first();
	};

	findByUserId = async (userId: string): Promise<IActivity[]> => {
		return await knexDb.table('activities').where({ userId }).orderBy('created_at', 'desc');
	};

    getByRequestId = async (requestId: string): Promise<IActivity[]> => {
        return await knexDb.table('activities').where({ requestId }).orderBy('created_at', 'desc');
    }

	findByRequestId = async (requestId: string): Promise<IActivity[]> => {
		return await knexDb.table('activities').where({ requestId }).orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<IActivity>): Promise<IActivity[]> => {
		return await knexDb('activities')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};
}

export const activityRepository = new ActivityRepository();
