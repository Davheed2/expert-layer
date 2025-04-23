import { WalletService } from '@/services/Wallet';
import { AppError } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { Request, Response } from 'express';
import { AppResponse } from '@/common/utils';
import { toJSON } from '@/common/utils';
import { knexDb as db } from '@/common/config';
import { requestsRepository } from '@/repository';

export class WalletController {
	constructor(private walletService = new WalletService(db)) {}

	createWallet = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const wallet = await this.walletService.getWalletBalance(user.id);

		return AppResponse(res, 201, toJSON({ wallet }), 'Wallet created successfully');
	});

	getWalletBalance = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const balance = await this.walletService.getWalletBalance(user.id);

		return AppResponse(res, 200, { balance }, 'Wallet balance retrieved successfully');
	});

	createRequestPayment = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const walletBalance = await this.walletService.getWalletBalance(user.id);

		const request = await requestsRepository.findById(requestId);
		if (!request) {
			throw new AppError('Request not found', 404);
		}

		// If wallet has enough balance, process payment from wallet
		if (walletBalance >= request.servicePrice) {
			const transaction = await this.walletService.processWalletPayment(user.id, requestId);
			return AppResponse(res, 200, toJSON(transaction), 'Payment processed successfully from wallet');
		}

		// Otherwise create payment intent for remaining amount
		const paymentIntent = await this.walletService.createRequestPaymentIntent(user.id, requestId);

		return AppResponse(
			res,
			200,
			{
				clientSecret: paymentIntent.client_secret,
				paymentMethod: 'stripe',
				amountToCharge: paymentIntent.amount,
				walletAmountUsed: walletBalance,
			},
			'Payment intent created successfully'
		);
	});

	createWalletTopUp = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { amount } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!amount || amount <= 0) {
			throw new AppError('Invalid amount', 400);
		}

		const paymentIntent = await this.walletService.createWalletTopUpIntent(user.id, amount);

		return AppResponse(
			res,
			200,
			{
				clientSecret: paymentIntent.client_secret,
				amount: paymentIntent.amount,
			},
			'Top-up payment intent created successfully'
		);
	});

	getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const transactions = await db('transactions').where({ userId: user.id }).orderBy('created_at', 'desc').limit(50);

		return AppResponse(res, 200, toJSON(transactions), 'Transaction history retrieved successfully');
	});
}

export const walletController = new WalletController();
