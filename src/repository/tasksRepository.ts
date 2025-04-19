// repositories/tasks.repository.ts

import { knexDb } from '@/common/config';
import { ITaskDetails, ITasks, ITaskWithDetails } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TasksRepository {
	create = async (payload: Partial<ITasks>) => {
		return await knexDb('tasks').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<ITasks | null> => {
		return await knexDb('tasks').where({ id, isDeleted: false }).first();
	};

	findByTask = async (task: string): Promise<ITasks | null> => {
		return await knexDb('tasks').where({ task, isDeleted: false }).first();
	};

	update = async (id: string, payload: Partial<ITasks>) => {
		return await knexDb('tasks')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	softDelete = async (id: string) => {
		return await knexDb('tasks').where({ id }).update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};

	findAll = async () => {
		return await knexDb('tasks').where({ isDeleted: false }).orderBy('created_at', 'desc');
	};

	findWithDetailsById = async (id: string): Promise<ITaskWithDetails | null> => {
		const task = await knexDb<ITasks>('tasks').where({ id, isDeleted: false }).first();

		if (!task) return null;

		const details = await knexDb<ITaskDetails>('task_details')
			.where({ taskId: id, isDeleted: false })
			.orderBy('created_at', 'desc');

		return {
			...task,
			details,
		};
	};

	findAllWithDetails = async (): Promise<ITaskWithDetails[]> => {
		const rows = await knexDb('tasks as t')
			.leftJoin('task_details as td', 't.id', 'td.taskId')
			.where('t.isDeleted', false)
			.andWhere(function () {
				this.whereNull('td.isDeleted').orWhere('td.isDeleted', false);
			})
			.select(
				't.id as task_id',
				't.task as task',
				't.taskImage as taskImage',
				't.created_at as task_created_at',
				't.updated_at as task_updated_at',

				'td.id as detail_id',
				'td.title as detail_title',
				'td.description as detail_description',
				'td.amount as detail_amount',
				'td.popular as detail_popular',
				'td.created_at as detail_created_at',
				'td.updated_at as detail_updated_at'
			)
			.orderBy('t.created_at', 'desc');

		// Convert flat results into nested structure
		const tasksMap: Record<string, ITaskWithDetails> = {};

		for (const row of rows) {
			if (!tasksMap[row.task_id]) {
				tasksMap[row.task_id] = {
					id: row.task_id,
					task: row.task,
					taskImage: row.taskImage,
					isDeleted: false,
					created_at: row.task_created_at,
					updated_at: row.task_updated_at,
					details: [],
				};
			}

			// If the task detail exists, add it
			if (row.detail_id) {
				tasksMap[row.task_id].details.push({
					id: row.detail_id,
					taskId: row.task_id,
					title: row.detail_title,
					description: row.detail_description,
					amount: Number(row.detail_amount),
					popular: row.detail_popular,
					isDeleted: false,
					created_at: row.detail_created_at,
					updated_at: row.detail_updated_at,
				});
			}
		}

		return Object.values(tasksMap);
	};
}

export const tasksRepository = new TasksRepository();
