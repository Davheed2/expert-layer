import { knexDb } from '@/common/config';
import { ITaskDetails } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TaskDetailsRepository {
	create = async (payload: Partial<ITaskDetails>) => {
		return await knexDb('task_details').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<ITaskDetails | null> => {
		return await knexDb('task_details').where({ id, isDeleted: false }).first();
	};

	findByTaskId = async (taskId: string): Promise<ITaskDetails[]> => {
		return await knexDb('task_details').where({ taskId, isDeleted: false }).orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<ITaskDetails>) => {
		return await knexDb('task_details')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	softDelete = async (id: string) => {
		return await knexDb('task_details')
			.where({ id })
			.update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};

	findAll = async () => {
		return await knexDb('task_details').where({ isDeleted: false }).orderBy('created_at', 'desc');
	};

	findAllPopular = async () => {
		return await knexDb('task_details').where({ isDeleted: false, popular: true }).orderBy('created_at', 'desc');
	};
}

export const taskDetailsRepository = new TaskDetailsRepository();
