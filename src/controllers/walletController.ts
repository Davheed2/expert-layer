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

		return AppResponse(res, 201, toJSON({ wallet }), 'Wallet created successfully', req);
	});

	getWalletBalance = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const balance = await this.walletService.getWalletBalance(user.id);

		return AppResponse(res, 200, { balance }, 'Wallet balance retrieved successfully', req);
	});

	createRequestPayment = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId, tierAmount } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const walletBalance = await this.walletService.getWalletBalance(user.id);

		const request = await requestsRepository.findById(requestId);
		if (!request) {
			throw new AppError('Request not found', 404);
		}

		// If wallet has enough balance, process payment from wallet
		const amountToPay = Number(request.servicePrice) + Number(request.durationAmount);
		if (walletBalance >= amountToPay) {
			const transaction = await this.walletService.processWalletPayment(user.id, requestId);
			return AppResponse(res, 200, toJSON(transaction), 'Payment processed successfully from wallet', req);
		}

		// Otherwise create payment intent for remaining amount
		const paymentIntent = await this.walletService.createRequestPaymentIntent(user.id, requestId, tierAmount);

		return AppResponse(
			res,
			200,
			{
				clientSecret: paymentIntent.client_secret,
				paymentMethod: 'stripe',
				amountToCharge: paymentIntent.amount,
				walletAmountUsed: walletBalance,
			},
			'Payment intent created successfully',
			req
		);
	});

	createWalletTopUp = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { amount, recurring } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (typeof recurring !== 'boolean') {
			throw new AppError('Invalid recurring value', 400);
		}

		if (!amount || amount <= 0) {
			throw new AppError('Invalid amount', 400);
		}

		const paymentIntent = await this.walletService.createWalletTopUpIntent(user.id, amount, recurring);

		return AppResponse(
			res,
			200,
			{
				clientSecret: paymentIntent.client_secret,
				amount: paymentIntent.amount,
			},
			'Top-up payment intent created successfully',
			req
		);
	});

	getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const transactions = await db('transactions').where({ userId: user.id }).orderBy('created_at', 'desc').limit(50);

		return AppResponse(res, 200, toJSON(transactions), 'Transaction history retrieved successfully', req);
	});
}

export const walletController = new WalletController();
