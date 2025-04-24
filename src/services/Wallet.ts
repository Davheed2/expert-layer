import Stripe from 'stripe';
import { Knex } from 'knex';
import { AppError } from '@/common/utils';
import { ITransaction } from '@/common/interfaces';
import { ENVIRONMENT } from '@/common/config';
import { Notification } from './Notification';

const stripe = new Stripe(ENVIRONMENT.STRIPE_SECRET_KEY as string, {
	apiVersion: '2025-03-31.basil',
});

export class WalletService {
	private db: Knex;

	constructor(db: Knex) {
		this.db = db;
	}

	async getOrCreateStripeCustomer(userId: string): Promise<string> {
		const user = await this.db('users').where({ id: userId }).first();

		if (!user) {
			throw new Error('User not found');
		}
		if (user.stripe_customer_id) {
			return user.stripe_customer_id;
		}

		// Create a new Stripe customer
		const customer = await stripe.customers.create({
			email: user.email,
			name: user.firstName + ' ' + user.lastName,
			metadata: {
				user_id: user.id,
			},
		});

		// Update user with Stripe customer ID
		await this.db('users').where({ id: userId }).update({
			stripe_customer_id: customer.id,
			updated_at: new Date(),
		});

		return customer.id;
	}

	async getWalletBalance(userId: string): Promise<number> {
		const wallet = await this.db('wallets').where({ userId }).first();

		if (wallet) {
			return wallet.balance;
		}

		if (!wallet) {
			const [newWallet] = await this.db('wallets').insert({ userId, balance: 0 }).returning('*');

			return newWallet.balance;
		}

		return wallet.balance;
	}

	async createRequestPaymentIntent(userId: string, requestId: string): Promise<Stripe.PaymentIntent> {
		const [user, request, wallet] = await Promise.all([
			this.db('users').where({ id: userId }).first(),
			this.db('requests').where({ id: requestId }).first(),
			this.db('wallets').where({ userId }).first(),
		]);

		if (!user || !request) {
			throw new AppError('User or request not found', 404);
		}

		const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);
		const walletBalance = wallet?.balance || 0;

		// If wallet balance covers the full cost, no need for payment intent
		if (walletBalance >= request.servicePrice) {
			throw new AppError('Wallet balance is sufficient for this task, use processWalletPayment instead');
		}

		// Amount to charge via Stripe (task price minus wallet balance)
		const amountToCharge = Math.max(0, request.servicePrice - walletBalance);

		// Create a payment intent for the remaining amount
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountToCharge,
			currency: 'usd',
			customer: stripeCustomerId,
			metadata: {
				user_id: userId,
				request_id: requestId,
				wallet_amount_used: walletBalance,
				request_price: request.servicePrice,
				request_name: request.taskName,
				transaction_id: request.transactionId,
			},
		});

		return paymentIntent;
	}

	// Process payment when wallet balance is sufficient
	async processWalletPayment(userId: string, requestId: string): Promise<ITransaction> {
		// Use transaction to ensure data consistency
		return await this.db.transaction(async (trx) => {
			const [request, wallet] = await Promise.all([
				trx('requests').where({ id: requestId }).first(),
				trx('wallets').where({ userId }).first(),
			]);

			if (!request || !wallet) {
				throw new Error('Task or wallet not found');
			}

			if (wallet.balance < request.servicePrice) {
				throw new AppError('Insufficient wallet balance');
			}

			// Update wallet balance
			const newBalance = wallet.balance - request.servicePrice;
			await trx('wallets').where({ id: wallet.id }).update({
				balance: newBalance,
				updated_at: new Date(),
			});

			// Update task status
			await trx('requests').where({ transactionId: request.transactionId }).update({
				status: 'submitted',
				updated_at: new Date(),
			});

			// Record transaction
			const [transaction] = await trx('transactions')
				.insert({
					userId: userId,
					requestId,
					status: 'success',
					type: 'task_payment',
					amount: -request.servicePrice,
					walletBalanceBefore: wallet.balance,
					walletBalanceAfter: newBalance,
					metadata: {
						task_name: request.taskName,
						payment_method: 'wallet',
					},
				})
				.returning('*');

			return transaction;
		});
	}

	// Handle successful payment and wallet updates
	async handleSuccessfulPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, wallet_amount_used } = paymentIntent.metadata;

		// Use transaction for data consistency
		await this.db.transaction(async (trx) => {
			const [user, request, wallet] = await Promise.all([
				trx('users').where({ id: user_id }).first(),
				trx('requests').where({ id: request_id }).first(),
				trx('wallets').where({ userId: user_id }).first(),
			]);

			if (!user || !request || !wallet) {
				throw new Error('User, request, or wallet not found');
			}

			const amountPaid = paymentIntent.amount;
			const walletAmountUsed = parseInt(wallet_amount_used || '0');
			const taskPrice = request.servicePrice;

			// Calculate if there's excess payment to add to wallet
			const totalPayment = amountPaid + walletAmountUsed;
			const excessAmount = totalPayment - taskPrice;

			// New wallet balance
			let newBalance = wallet.balance;

			// If wallet balance was used, deduct it
			if (walletAmountUsed > 0) {
				newBalance -= walletAmountUsed;
			}

			// If there's excess payment, add to wallet
			if (excessAmount > 0) {
				newBalance += excessAmount;
			}

			// Update wallet balance
			await trx('wallets').where({ id: wallet.id }).update({
				balance: newBalance,
				updated_at: new Date(),
			});

			// Update task status
			await trx('requests').where({ transactionId: request.transactionId }).update({
				status: 'submitted',
				updated_at: new Date(),
			});

			// Record transaction
			await trx('transactions').insert({
				userId: user_id,
				requestId: request_id,
				type: 'task_payment',
				amount: -taskPrice,
				status: 'success',
				walletBalanceBefore: wallet.balance,
				walletBalanceAfter: newBalance,
				stripePaymentIntentId: paymentIntentId,
				metadata: {
					payment_method: 'stripe',
					wallet_amount_used: walletAmountUsed,
					stripe_amount: amountPaid,
					excess_added_to_wallet: excessAmount > 0 ? excessAmount : 0,
				},
			});

			// If excess was added to wallet, record a separate transaction for that
			if (excessAmount > 0) {
				await trx('transactions').insert({
					userId: user_id,
					type: 'wallet_credit',
					amount: excessAmount,
					status: 'success',
					walletBalanceBefore: newBalance - excessAmount,
					walletBalanceAfter: newBalance,
					stripePaymentIntentId: paymentIntentId,
					metadata: {
						source: 'excess_payment',
						request_id,
					},
				});
			}
		});
	}

	// Top up wallet directly
	async createWalletTopUpIntent(userId: string, amount: number): Promise<Stripe.PaymentIntent> {
		const user = await this.db('users').where({ id: userId }).first();

		if (!user) {
			throw new Error('User not found');
		}

		const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

		// Create a payment intent for wallet top-up
		const paymentIntent = await stripe.paymentIntents.create({
			amount,
			currency: 'usd',
			customer: stripeCustomerId,
			metadata: {
				user_id: userId,
				transaction_type: 'wallet_topup',
				amount: amount.toString(),
			},
		});

		return paymentIntent;
	}

	// Handle successful wallet top-up
	async handleWalletTopUp(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.metadata.transaction_type !== 'wallet_topup') {
			throw new AppError('Not a wallet top-up transaction');
		}

		const userId = paymentIntent.metadata.user_id;
		const amount = parseInt(paymentIntent.amount.toString());

		// Update wallet balance
		await this.db.transaction(async (trx) => {
			const wallet = await trx('wallets').where({ userId }).first();

			if (!wallet) {
				// Create wallet if it doesn't exist
				await trx('wallets').insert({ userId, balance: amount });

				await trx('transactions').insert({
					userId,
					type: 'deposit',
					amount,
					status: 'success',
					walletBalanceBefore: 0,
					walletBalanceAfter: amount,
					stripePaymentIntentId: paymentIntentId,
				});
			} else {
				// Update existing wallet
				const newBalance = wallet.balance + amount;

				await trx('wallets').where({ id: wallet.id }).update({
					balance: newBalance,
					updated_at: new Date(),
				});

				await trx('transactions').insert({
					userId,
					type: 'deposit',
					amount,
					status: 'success',
					walletBalanceBefore: wallet.balance,
					walletBalanceAfter: newBalance,
					stripePaymentIntentId: paymentIntentId,
				});
			}
		});
	}

	async handleFailedPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, transaction_type } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			// Record the failed transaction
			await trx('transactions').insert({
				userId: user_id,
				requestId: request_id || null,
				type: transaction_type === 'wallet_topup' ? 'refund' : 'refund',
				amount: 0,
				status: 'failed',
				stripePaymentIntentId: paymentIntentId,
				metadata: {
					failure_reason: paymentIntent.last_payment_error?.message || 'Unknown failure reason',
					attempted_amount: paymentIntent.amount,
				},
			});

			// If this was a service payment, update the service status
			if (request_id) {
				await trx('requests').where({ id: request_id }).update({
					status: 'failed',
					updated_at: new Date(),
				});
			}

			await Notification.add({
				userId: user_id,
				title: 'Payment Failed',
				message:
					transaction_type === 'wallet_topup'
						? 'Your wallet top-up payment has failed.'
						: 'Your payment for a service has failed.',
			});
		});
	}

	async handleProcessingPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, transaction_type } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			await trx('transactions').insert({
				userId: user_id,
				requestId: request_id || null,
				type: transaction_type === 'wallet_topup' ? 'wallet_credit' : 'task_payment',
				amount: 0,
				status: 'processing',
				stripePaymentIntentId: paymentIntentId,
				metadata: {
					attempted_amount: paymentIntent.amount,
				},
			});

			// If this was a service payment, update the request status
			if (request_id) {
				await trx('requests').where({ id: request_id }).update({
					status: 'processing',
					updated_at: new Date(),
				});
			}

			// Optionally, trigger a notification to the user about the processing payment
			await Notification.add({
				userId: user_id,
				title: 'Payment Failed',
				message:
					transaction_type === 'wallet_topup'
						? 'Your wallet top-up payment is being processed.'
						: 'Your payment for a service is being processed.',
			});
		});
	}

	async handleCanceledPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, transaction_type } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			// Record the canceled transaction
			await trx('transactions').insert({
				userId: user_id,
				requestId: request_id || null,
				//USE FAILED INSTEAD
				type: transaction_type === 'wallet_topup' ? 'wallet_credit' : 'wallet_credit',
				amount: 0, // No money moved
				status: 'failed',
				stripePaymentIntentId: paymentIntentId,
				metadata: {
					cancelled_amount: paymentIntent.amount,
					cancellation_reason: paymentIntent.cancellation_reason || 'Unknown',
				},
			});

			// If this was a service payment, update the service status
			if (request_id) {
				await trx('requests').where({ id: request_id }).update({
					status: 'failed',
					updated_at: new Date(),
				});
			}

			await Notification.add({
				userId: user_id,
				title: 'Payment Canceled',
				message:
					transaction_type === 'wallet_topup'
						? 'Your wallet top-up payment has been canceled.'
						: 'Your payment for a service has been canceled.',
			});
		});
	}

	// async handleRefund(paymentIntentId: string): Promise<void> {
	// 	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
	// 		expand: ['charges'],
	// 	});
	// 	const charge = paymentIntent.charges?.data[0];

	// 	if (!charge.refunded) {
	// 		throw new Error('Charge is not refunded');
	// 	}

	// 	const { user_id, service_id, transaction_type } = paymentIntent.metadata;
	// 	const refundAmount = charge.amount_refunded;

	// 	await this.db.transaction(async (trx) => {
	// 		// Get current wallet balance
	// 		const wallet = await trx('wallets').where({ userId: user_id }).first();
	// 		if (!wallet) {
	// 			throw new Error('Wallet not found');
	// 		}

	// 		const newBalance = wallet.balance + refundAmount;

	// 		// Update wallet with refunded amount
	// 		await trx('wallets').where({ id: wallet.id }).update({
	// 			balance: newBalance,
	// 			updated_at: new Date(),
	// 		});

	// 		// Record the refund transaction
	// 		await trx('transactions').insert({
	// 			userId: user_id,
	// 			serviceId: service_id || null,
	// 			type: 'refund',
	// 			amount: refundAmount,
	// 			walletBalanceBefore: wallet.balance,
	// 			walletBalanceAfter: newBalance,
	// 			status: 'success',
	// 			stripePaymentIntentId: paymentIntentId,
	// 			metadata: {
	// 				refund_id: charge.refunds.data[0].id,
	// 				refund_reason: charge.refunds.data[0].reason || 'No reason provided',
	// 			},
	// 		});

	// 		// If this was a service payment, update the service status
	// 		if (service_id) {
	// 			await trx('services').where({ id: service_id }).update({
	// 				status: 'refunded',
	// 				updated_at: new Date(),
	// 			});
	// 		}

	// 		// Notify the user about the refund
	// 		await trx('notifications').insert({
	// 			userId: user_id,
	// 			type: 'payment_refunded',
	// 			message: 'Your payment has been refunded to your wallet.',
	// 			metadata: {
	// 				paymentIntentId,
	// 				refundAmount,
	// 				service_id: service_id || null,
	// 			},
	// 			isRead: false,
	// 		});
	// 	});
	// }

	// Utility function to get payment intent details - useful for frontend status checking
	async getPaymentStatus(paymentIntentId: string): Promise<{
		id: string;
		status: string;
		amount: number;
		currency: string;
		created: number;
		metadata: Record<string, string>;
	}> {
		try {
			const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

			return {
				id: paymentIntent.id,
				status: paymentIntent.status,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				created: paymentIntent.created,
				metadata: paymentIntent.metadata,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to retrieve payment status: ${error.message}`);
			} else {
				throw new Error('Failed to retrieve payment status: Unknown error');
			}
		}
	}
}
