import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { tasksRepository, taskDetailsRepository, userRepository } from '@/repository';

export class TasksController {
	createTask = catchAsync(async (req: Request, res: Response) => {
		const { file, user } = req;
		const { task } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!file) {
			throw new AppError('File is required', 400);
		}
		if (!task) {
			throw new AppError('Please provide a task name', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to create tasks', 401);
		}

		const extinguishUser = await userRepository.findById(user.id as string);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

        const taskExists = await tasksRepository.findByTask(task);
        if (taskExists) {
            throw new AppError('Task already exists', 400);
        }

		const { secureUrl } = await uploadPictureFile({
			fileName: `tasks-image/${Date.now()}-${file.originalname}`,
			buffer: file.buffer,
			mimetype: file.mimetype,
		});
		const newTask = await tasksRepository.create({ task, taskImage: secureUrl });

		return AppResponse(res, 201, toJSON(newTask), 'Task created successfully');
	});

	createTaskDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { taskId, title, description, amount, popular } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!taskId) {
			throw new AppError('Please provide a task ID', 400);
		}
		if (!title) {
			throw new AppError('Please provide a title', 400);
		}
		if (!description) {
			throw new AppError('Please provide a description', 400);
		}
		if (!amount) {
			throw new AppError('Please provide an amount', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to create task details', 401);
		}
		const extinguishUser = await userRepository.findById(user.id as string);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}
		const task = await tasksRepository.findById(taskId);
		if (!task) {
			throw new AppError('Task not found', 404);
		}

		const newTaskDetails = await taskDetailsRepository.create({
			taskId,
			title,
			description,
			amount,
			popular,
		});
		return AppResponse(res, 201, toJSON(newTaskDetails), 'Task details created successfully');
	});

	createTaskWithDetails = catchAsync(async (req: Request, res: Response) => {
		const { file, user } = req;
		const { task, title, description, amount, popular } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!file) {
			throw new AppError('File is required', 400);
		}
		if (!task) {
			throw new AppError('Please provide a task name', 400);
		}
		if (!title) {
			throw new AppError('Please provide a title', 400);
		}
		if (!description) {
			throw new AppError('Please provide a description', 400);
		}
		if (!amount) {
			throw new AppError('Please provide an amount', 400);
		}
        if (!popular) {
            throw new AppError('Please provide a popular status', 400);
        }
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to create tasks or task details', 401);
		}

		const extinguishUser = await userRepository.findById(user.id as string);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

        const taskExists = await tasksRepository.findByTask(task);
        if (taskExists) {
            throw new AppError('Task already exists', 400);
        }

		const { secureUrl } = await uploadPictureFile({
			fileName: `tasks-image/${Date.now()}-${file.originalname}`,
			buffer: file.buffer,
			mimetype: file.mimetype,
		});

		const newTask = await tasksRepository.create({ task, taskImage: secureUrl });
		if (!newTask) {
			throw new AppError('Failed to create task', 500);
		}

		const newTaskDetails = await taskDetailsRepository.create({
			taskId: newTask[0].id,
			title,
			description,
			amount,
			popular,
		});
		if (!newTaskDetails) {
			throw new AppError('Failed to create task details', 500);
		}

		return AppResponse(
			res,
			201,
			toJSON({ task: newTask, taskDetails: newTaskDetails }),
			'Task and task details created successfully'
		);
	});

	findAllTasks = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const tasks = await tasksRepository.findAll();
		if (!tasks) {
			throw new AppError('No tasks found', 404);
		}

		return AppResponse(res, 200, toJSON(tasks), 'Tasks retrieved successfully');
	});

	findAllTasksWithDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const tasks = await tasksRepository.findAllWithDetails();
		if (!tasks) {
			throw new AppError('No tasks found', 404);
		}

		return AppResponse(res, 200, toJSON(tasks), 'Tasks with details retrieved successfully');
	});

	findAllTaskDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const taskDetails = await taskDetailsRepository.findAll();
		if (!taskDetails) {
			throw new AppError('No task details found', 404);
		}

		return AppResponse(res, 200, toJSON(taskDetails), 'Task details retrieved successfully');
	});

	findPopularTaskDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const popularTaskDetails = await taskDetailsRepository.findAllPopular();
		if (!popularTaskDetails) {
			throw new AppError('No poular task details found', 404);
		}

		return AppResponse(res, 200, toJSON(popularTaskDetails), 'Popular task details retrieved successfully');
	});
}

export const tasksController = new TasksController();
