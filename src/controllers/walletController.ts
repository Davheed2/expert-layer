import { WalletService } from '@/services/Wallet';
import { AppError } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { Request, Response } from 'express';
import { AppResponse } from '@/common/utils';
import { toJSON } from '@/common/utils';
import { knexDb as db, ENVIRONMENT } from '@/common/config';
import { requestsRepository } from '@/repository';
import Stripe from 'stripe';

const stripe = new Stripe(ENVIRONMENT.STRIPE_SECRET_KEY as string, {
	apiVersion: '2025-03-31.basil',
});

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

		const result = await this.walletService.createWalletTopUpIntent(user.id, amount, recurring);

		// One-time PaymentIntent response
		if ('client_secret' in result) {
			return AppResponse(
				res,
				200,
				{
					clientSecret: result.client_secret,
					amount: result.amount,
				},
				'One-time top-up payment intent created successfully',
				req
			);
		}

		if ('priceId' in result) {
			const session = await stripe.checkout.sessions.create({
				customer: result.customerId,
				payment_method_types: ['card'],
				mode: 'subscription',
				line_items: [
					{
						price: result.priceId,
						quantity: 1,
					},
				],
				success_url: 'https://app.expertlayer.co/dashboard',
				cancel_url: 'https://app.expertlayer.co/dashboard',
				metadata: {
					user_id: user.id,
					amount: amount.toString(),
					transaction_type: 'wallet_subscription',
				},
			});

			return AppResponse(
				res,
				200,
				{
					redirectUrl: session.url,
					sessionId: session.id,
					amount: amount,
				},
				'Redirecting to Stripe Checkout for recurring subscription',
				req
			);
		}
		// If the structure is unexpected
		throw new AppError('Unexpected Stripe response structure', 500);
	});

	getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const transactions = await db('transactions').where({ userId: user.id }).orderBy('created_at', 'desc').limit(50);

		return AppResponse(res, 200, toJSON(transactions), 'Transaction history retrieved successfully', req);
	});

	getUserSubscriptions = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const subscriptions = await this.walletService.getUserSubscriptions(user.id);

		// Format the response with relevant information
		type SubscriptionType = Stripe.Subscription;
		const formattedSubscriptions = subscriptions.map((sub: SubscriptionType) => {
			let nextBillingDate: Date | null = null;

			if (
				sub.billing_cycle_anchor &&
				sub.items.data[0]?.price.recurring?.interval &&
				sub.items.data[0]?.price.recurring?.interval_count
			) {
				const anchor = new Date(sub.billing_cycle_anchor * 1000);
				const interval = sub.items.data[0]?.price.recurring?.interval;
				const intervalCount = sub.items.data[0]?.price.recurring?.interval_count;
				const now = new Date();

				// Calculate periods since anchor
				let monthsToAdd = 0;
				const safeIntervalCount = typeof intervalCount === 'number' ? intervalCount : 1;
				if (interval === 'month') {
					monthsToAdd = safeIntervalCount;
				} else if (interval === 'year') {
					monthsToAdd = safeIntervalCount * 12;
				} else if (interval === 'week') {
					monthsToAdd = safeIntervalCount / 4.345;
				} else if (interval === 'day') {
					monthsToAdd = safeIntervalCount / 30.417;
				}

				// Add intervals until we find the next billing date after now
				const candidateDate = new Date(anchor);
				while (candidateDate <= now) {
					if (interval === 'month' || interval === 'year') {
						candidateDate.setMonth(candidateDate.getMonth() + monthsToAdd);
					} else if (interval === 'week') {
						candidateDate.setDate(candidateDate.getDate() + intervalCount * 7);
					} else if (interval === 'day') {
						candidateDate.setDate(candidateDate.getDate() + intervalCount);
					}
				}
				nextBillingDate = candidateDate;
			}

			return {
				id: sub.id,
				status: sub.status,
				amount: sub.items?.data[0]?.price?.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 0,
				currency: sub.currency,
				interval: sub.items?.data[0]?.price?.recurring?.interval || 'unknown',
				// current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000) : null,
				// current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
				next_billing_date: nextBillingDate,
				cancel_at_period_end: sub.cancel_at_period_end || false,
				canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
				created: sub.created ? new Date(sub.created * 1000) : null,
				product_name: (sub.items?.data[0]?.price?.product as Stripe.Product)?.name || 'Wallet Top-Up',
				next_payment_attempt: sub.next_pending_invoice_item_invoice
					? new Date(sub.next_pending_invoice_item_invoice * 1000)
					: null,
			};
		});

		return AppResponse(
			res,
			200,
			{ subscriptions: formattedSubscriptions },
			'Subscriptions retrieved successfully',
			req
		);
	});

	getSubscription = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { subscriptionId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!subscriptionId) {
			throw new AppError('Subscription ID is required', 400);
		}

		const subscription: Stripe.Subscription = await this.walletService.getSubscription(
			user.id,
			subscriptionId as string
		);

		let nextBillingDate: Date | null = null;
		if (
			subscription.billing_cycle_anchor &&
			subscription.items.data[0]?.price.recurring?.interval &&
			subscription.items.data[0]?.price.recurring?.interval_count
		) {
			const anchor = new Date(subscription.billing_cycle_anchor * 1000);
			const interval = subscription.items.data[0]?.price.recurring?.interval;
			const intervalCount = subscription.items.data[0]?.price.recurring?.interval_count;
			const now = new Date();

			// Calculate periods since anchor
			let monthsToAdd = 0;
			const safeIntervalCount = typeof intervalCount === 'number' ? intervalCount : 1;
			if (interval === 'month') {
				monthsToAdd = safeIntervalCount;
			} else if (interval === 'year') {
				monthsToAdd = safeIntervalCount * 12;
			} else if (interval === 'week') {
				monthsToAdd = safeIntervalCount / 4.345;
			} else if (interval === 'day') {
				monthsToAdd = safeIntervalCount / 30.417;
			}

			// Add intervals until we find the next billing date after now
			const candidateDate = new Date(anchor);
			while (candidateDate <= now) {
				if (interval === 'month' || interval === 'year') {
					candidateDate.setMonth(candidateDate.getMonth() + monthsToAdd);
				} else if (interval === 'week') {
					candidateDate.setDate(candidateDate.getDate() + intervalCount * 7);
				} else if (interval === 'day') {
					candidateDate.setDate(candidateDate.getDate() + intervalCount);
				}
			}
			nextBillingDate = candidateDate;
		}

		// Sanitize default_payment_method to include only brand, last4, exp_month, and exp_year
		let sanitizedPaymentMethod: SanitizedPaymentMethod | undefined;
		interface SanitizedPaymentMethod {
			brand: string;
			last4: string;
			exp_month: number;
			exp_year: number;
		}
		if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
			const paymentMethod = subscription.default_payment_method;
			sanitizedPaymentMethod = {
				brand: paymentMethod.card?.brand || 'unknown',
				last4: paymentMethod.card?.last4 || '****',
				exp_month: paymentMethod.card?.exp_month || 0,
				exp_year: paymentMethod.card?.exp_year || 0,
			};
		}

		const formattedSubscription = {
			id: subscription.id,
			status: subscription.status,
			amount: subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
			currency: subscription.currency,
			interval: subscription.items.data[0]?.price.recurring?.interval,
			next_billing_date: nextBillingDate,
			cancel_at_period_end: subscription.cancel_at_period_end,
			canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
			created: new Date(subscription.created * 1000),
			product_name: 'Wallet Top-Up',
			default_payment_method: sanitizedPaymentMethod,
		};

		return AppResponse(res, 200, { subscription: formattedSubscription }, 'Subscription retrieved successfully', req);
	});

	cancelSubscription = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { subscriptionId, cancelImmediately = false } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!subscriptionId) {
			throw new AppError('Subscription ID is required', 400);
		}

		const canceledSubscription = await this.walletService.cancelSubscription(
			user.id,
			subscriptionId,
			cancelImmediately
		);

		const message = cancelImmediately
			? 'Subscription canceled immediately'
			: 'Subscription will be canceled at the end of the current billing period';

		return AppResponse(
			res,
			200,
			{
				subscriptionId: canceledSubscription.id,
				status: canceledSubscription.status,
				cancel_at_period_end: canceledSubscription.cancel_at_period_end,
			},
			message,
			req
		);
	});

	reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { subscriptionId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!subscriptionId) {
			throw new AppError('Subscription ID is required', 400);
		}

		const reactivatedSubscription = await this.walletService.reactivateSubscription(user.id, subscriptionId);

		return AppResponse(
			res,
			200,
			{
				subscriptionId: reactivatedSubscription.id,
				status: reactivatedSubscription.status,
				cancel_at_period_end: reactivatedSubscription.cancel_at_period_end,
			},
			'Subscription reactivated successfully',
			req
		);
	});

	updateSubscriptionAmount = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { amount, subscriptionId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!subscriptionId) {
			throw new AppError('Subscription ID is required', 400);
		}

		if (!amount || amount <= 0) {
			throw new AppError('Invalid amount', 400);
		}

		const updatedSubscription = await this.walletService.updateSubscriptionAmount(user.id, subscriptionId, amount);

		return AppResponse(
			res,
			200,
			{
				subscriptionId: updatedSubscription.id,
				newAmount: updatedSubscription.items.data[0]?.price.unit_amount
					? updatedSubscription.items.data[0].price.unit_amount / 100
					: 0,
				status: updatedSubscription.status,
			},
			'Subscription amount updated successfully',
			req
		);
	});

	getSubscriptionInvoices = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { limit = 10, offset = 0, subscriptionId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		if (!subscriptionId) {
			throw new AppError('Subscription ID is required', 400);
		}

		// Parse and validate query parameters
		const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);
		const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

		const result = await this.walletService.getSubscriptionInvoices(
			user.id,
			subscriptionId as string,
			parsedLimit,
			parsedOffset
		);

		const formattedInvoices = result.invoices.map((invoice) => ({
			id: invoice.id,
			amount_paid: invoice.amount_paid / 100,
			amount_due: invoice.amount_due / 100,
			currency: invoice.currency,
			status: invoice.status,
			created: new Date(invoice.created * 1000),
			period_start: new Date(invoice.period_start * 1000),
			period_end: new Date(invoice.period_end * 1000),
			paid: invoice.status === 'paid',
			hosted_invoice_url: invoice.hosted_invoice_url,
			invoice_pdf: invoice.invoice_pdf,
		}));

		return AppResponse(
			res,
			200,
			{
				invoices: formattedInvoices,
				pagination: {
					limit: parsedLimit,
					offset: parsedOffset,
					hasMore: result.hasMore,
					count: formattedInvoices.length,
				},
			},
			'Billing history retrieved successfully',
			req
		);
	});
}

export const walletController = new WalletController();
