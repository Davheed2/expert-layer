import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { teamRepository, transactionRepository } from '@/repository';
import { ITransaction } from '@/common/interfaces';

export class TransactionController {
	findByUserId = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		let transactions: ITransaction[] = [];

		if (user.role === 'accountmanager') {
			const memberIds = await teamRepository.getMemberIdsForAccountManager(user.id);

			if (!memberIds.length) {
				return AppResponse(res, 200, [], 'No users found in account manager’s teams');
			}

			transactions = await transactionRepository.findByUserIds(memberIds);
		} else {
			transactions = await transactionRepository.findByUserId(user.id);
		}
		if (!transactions.length) {
			throw new AppError('No transactions found', 404);
		}

		return AppResponse(res, 200, toJSON(transactions), 'Transactions retrieved successfully');
	});
}

export const transactionController = new TransactionController();
