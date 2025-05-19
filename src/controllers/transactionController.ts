import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { transactionRepository } from '@/repository';

export class TransactionController {
	findByUserId = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const transaction = await transactionRepository.findByUserId(user.id);
		if (!transaction) throw new AppError('No transaction found', 404);

		return AppResponse(res, 200, toJSON(transaction), 'User Transacions retrieved successfully');
	});
}

export const transactionController = new TransactionController();
