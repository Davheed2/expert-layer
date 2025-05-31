import Stripe from 'stripe';
import { Knex } from 'knex';
import { AppError, referenceGenerator } from '@/common/utils';
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

	async createRequestPaymentIntent(
		userId: string,
		requestId: string,
		tierAmount: number
	): Promise<Stripe.PaymentIntent> {
		const [user, request, wallet] = await Promise.all([
			this.db('users').where({ id: userId }).first(),
			this.db('requests').where({ id: requestId }).first(),
			this.db('wallets').where({ userId }).first(),
		]);

		if (!user || !request) {
			throw new AppError('User or request not found', 404);
		}

		if (!tierAmount) {
			throw new AppError('Tier Amount is required', 404);
		}

		const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);
		const walletBalance = wallet?.balance || 0;

		// If wallet balance covers the full cost, no need for payment intent
		const amountToPay = Number(request.servicePrice);
		if (walletBalance >= amountToPay) {
			throw new AppError('Wallet balance is sufficient for this task, use processWalletPayment instead');
		}

		// Amount to charge via Stripe (task price minus wallet balance)
		//const amountToCharge = Math.max(0, amountToPay - walletBalance);

		// Create a payment intent for the remaining amount
		const paymentIntent = await stripe.paymentIntents.create({
			amount: tierAmount,
			currency: 'usd',
			customer: stripeCustomerId,
			payment_method_types: ['card'],
			metadata: {
				user_id: userId,
				request_id: requestId,
				wallet_amount_used: walletBalance,
				request_price: amountToPay,
				request_name: request.serviceName,
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

			const amountToPay = Number(request.servicePrice) + Number(request.durationAmount);
			if (wallet.balance < amountToPay) {
				throw new AppError('Insufficient wallet balance');
			}

			// Update wallet balance
			const newBalance = wallet.balance - amountToPay;
			await trx('wallets').where({ id: wallet.id }).update({
				balance: newBalance,
				updated_at: new Date(),
			});

			// Update task status
			await trx('requests').where({ transactionId: request.transactionId }).update({
				status: 'finding_expert',
				updated_at: new Date(),
			});

			// Record transaction
			const reference = referenceGenerator();
			const [transaction] = await trx('transactions')
				.insert({
					userId: userId,
					status: 'success',
					type: 'request',
					description: `$${amountToPay} paid for ${request.serviceName}`,
					reference,
					amount: -amountToPay,
					walletBalanceBefore: wallet.balance,
					walletBalanceAfter: newBalance,
					metadata: {
						request_name: request.serviceName,
						payment_method: 'wallet',
					},
				})
				.returning('*');

			return transaction;
		});
	}

	// async handleProcessingPayment(paymentIntentId: string): Promise<void> {
	// 	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
	// 	const { user_id, request_id, wallet_amount_used, transaction_type, reference } = paymentIntent.metadata;

	// 	console.log('reference', reference);

	// 	const amount = paymentIntent.amount;

	// 	await this.db.transaction(async (trx) => {
	// 		await trx('transactions').insert({
	// 			userId: user_id,
	// 			type: transaction_type === 'wallet_topup' ? 'credit' : 'request',
	// 			amount,
	// 			status: 'processing',
	// 			description:
	// 				transaction_type === 'wallet_topup' ? `$${amount} Credit` : `Payment of $${amount} for request ${request_id}`,
	// 			reference,
	// 			stripePaymentIntentId: paymentIntentId,
	// 			walletBalanceBefore: wallet_amount_used,
	// 			walletBalanceAfter: wallet_amount_used,
	// 			metadata: {
	// 				attempted_amount: amount,
	// 				wallet_amount_used,
	// 				request_id,
	// 			},
	// 		});

	// 		await Notification.add({
	// 			userId: user_id,
	// 			title: 'Payment Processing',
	// 			message:
	// 				transaction_type === 'wallet_topup'
	// 					? 'Your wallet top-up is being processed.'
	// 					: 'Your service payment is being processed.',
	// 		});
	// 	});
	// }

	async handleProcessingPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		let user_id, request_id, wallet_amount_used, transaction_type, reference, amount;

		// Check if this is a subscription payment by looking for customer and empty metadata
		const isSubscriptionPayment =
			paymentIntent.customer &&
			paymentIntent.metadata &&
			Object.keys(paymentIntent.metadata).length === 0 &&
			paymentIntent.description === 'Subscription creation';

		if (isSubscriptionPayment) {
			// This is a subscription payment - find the subscription for this customer
			//console.log('Detected subscription payment, finding subscription for customer:', paymentIntent.customer);

			try {
				// Get the most recent subscription for this customer
				const subscriptions = await stripe.subscriptions.list({
					customer: paymentIntent.customer as string,
					limit: 1,
					expand: ['data.latest_invoice'],
				});

				if (subscriptions.data.length === 0) {
					console.warn('No subscriptions found for customer:', paymentIntent.customer);
					return;
				}

				const subscription = subscriptions.data[0];
				const subscriptionMetadata = subscription.metadata || {};

				user_id = subscriptionMetadata.user_id;
				transaction_type = subscriptionMetadata.transaction_type;
				reference = subscriptionMetadata.reference;
				amount = subscriptionMetadata.amount;

				console.log('Found subscription:', subscription.id);
				console.log('Subscription metadata:', subscriptionMetadata);

				if (!user_id || !reference || !amount || transaction_type !== 'wallet_subscription') {
					console.warn('Invalid subscription metadata for customer:', paymentIntent.customer);
					return;
				}
			} catch (error) {
				console.error('Error retrieving subscriptions:', error);
				return;
			}
		} else {
			// Regular payment - use payment intent metadata
			const metadata = paymentIntent.metadata || {};
			user_id = metadata.user_id;
			request_id = metadata.request_id;
			wallet_amount_used = metadata.wallet_amount_used;
			transaction_type = metadata.transaction_type;
			reference = metadata.reference;
			amount = metadata.amount;

			// If no metadata found in regular payment, skip processing
			if (!user_id) {
				console.log('No user_id found in payment intent metadata, skipping processing');
				return;
			}
		}

		console.log('Processing payment with:');
		console.log('- reference:', reference);
		console.log('- transaction_type:', transaction_type);
		console.log('- user_id:', user_id);
		console.log('- amount:', amount);

		const paymentAmount = paymentIntent.amount;

		await this.db.transaction(async (trx) => {
			if (transaction_type === 'wallet_subscription') {
				// Handle recurring subscription processing
				if (!user_id || !reference || !amount) {
					console.warn('Missing metadata for wallet subscription processing:', paymentIntentId);
					return;
				}

				// Convert amount from cents to dollars
				const amountInDollars = Number(paymentAmount) / 100;

				await trx('transactions').insert({
					userId: user_id,
					type: 'credit',
					amount: amountInDollars,
					status: 'processing',
					description: `${amountInDollars} Recurring Credit`,
					reference,
					stripePaymentIntentId: paymentIntentId,
					walletBalanceBefore: 0, // Will be updated when payment succeeds
					walletBalanceAfter: 0, // Will be updated when payment succeeds
					metadata: {
						attempted_amount: amountInDollars,
						transaction_type: 'wallet_subscription',
					},
				});

				await Notification.add({
					userId: user_id,
					title: 'Recurring Payment Processing',
					message: 'Your recurring wallet top-up is being processed.',
				});
			} else {
				// Handle regular wallet top-up and service payments
				await trx('transactions').insert({
					userId: user_id,
					type: transaction_type === 'wallet_topup' ? 'credit' : 'request',
					amount: paymentAmount,
					status: 'processing',
					description:
						transaction_type === 'wallet_topup'
							? `${paymentAmount} Credit`
							: `Payment of ${paymentAmount} for request ${request_id}`,
					reference,
					stripePaymentIntentId: paymentIntentId,
					walletBalanceBefore: wallet_amount_used,
					walletBalanceAfter: wallet_amount_used,
					metadata: {
						attempted_amount: paymentAmount,
						wallet_amount_used,
						request_id,
					},
				});

				await Notification.add({
					userId: user_id,
					title: 'Payment Processing',
					message:
						transaction_type === 'wallet_topup'
							? 'Your wallet top-up is being processed.'
							: 'Your service payment is being processed.',
				});
			}
		});
	}

	// Handle successful payment and wallet updates
	async handleSuccessfulPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, wallet_amount_used } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			const [user, request, wallet] = await Promise.all([
				trx('users').where({ id: user_id }).first(),
				trx('requests').where({ id: request_id }).first(),
				trx('wallets').where({ userId: user_id }).first(),
			]);

			if (!user || !request || !wallet) throw new Error('User, request, or wallet not found');

			const amountPaidInCents = paymentIntent.amount;
			const amountPaid = amountPaidInCents / 100;

			const walletUsed = parseFloat(wallet_amount_used || '0'); // assume already in dollars
			const taskPrice = Number(request.servicePrice) + Number(request.durationAmount);
			const totalPayment = amountPaid + walletUsed;
			const excessAmount = totalPayment - taskPrice;

			let newBalance = wallet.balance;
			if (walletUsed > 0) newBalance -= walletUsed;
			if (excessAmount > 0) newBalance += excessAmount;

			await trx('wallets').where({ id: wallet.id }).update({
				balance: newBalance,
				updated_at: new Date(),
			});

			await trx('requests').where({ transactionId: request.transactionId }).update({
				status: 'finding_expert',
				updated_at: new Date(),
			});

			await trx('transactions')
				.where({ stripePaymentIntentId: paymentIntentId })
				.update({
					status: 'success',
					description: `$${amountPaid} paid for ${request.serviceName}`,
					walletBalanceBefore: wallet.balance,
					walletBalanceAfter: newBalance,
					metadata: {
						payment_method: 'stripe',
						wallet_amount_used: walletUsed,
						stripe_amount: amountPaid,
						excess_added_to_wallet: excessAmount > 0 ? excessAmount : 0,
					},
				});

			if (excessAmount > 0) {
				const ref = referenceGenerator();
				await trx('transactions').insert({
					userId: user_id,
					type: 'credit',
					status: 'success',
					amount: excessAmount,
					reference: ref,
					description: `$${excessAmount} Credit`,
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
	async createWalletTopUpIntent(
		userId: string,
		amount: number,
		recurring: boolean
	): Promise<Stripe.PaymentIntent | { priceId: string; customerId: string }> {
		const user = await this.db('users').where({ id: userId }).first();
		if (!user) throw new AppError('User not found');

		if (amount < 0.5) throw new AppError('Amount must be at least $0.50');

		const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);
		const reference = referenceGenerator();

		if (recurring) {
			// // 1. Check if product/price exists, or create one dynamically
			// const product = await stripe.products.create({
			// 	name: `Wallet Top-Up for ${user.email}`,
			// });

			// const price = await stripe.prices.create({
			// 	unit_amount: Math.round(amount * 100),
			// 	currency: 'usd',
			// 	recurring: { interval: 'month' },
			// 	product: product.id,
			// 	// metadata: {
			// 	// 	user_id: userId,
			// 	// 	amount: amount.toString(),
			// 	// 	reference,
			// 	// 	transaction_type: 'wallet_subscription',
			// 	// },
			// });

			// const subscription = await stripe.subscriptions.create({
			// 	customer: stripeCustomerId,
			// 	items: [{ price: price.id }],
			// 	payment_behavior: 'default_incomplete',
			// 	payment_settings: {
			// 		payment_method_types: ['card'],
			// 		save_default_payment_method: 'on_subscription',
			// 	},
			// 	expand: ['latest_invoice'],
			// });

			// // Update with metadata after creation
			// const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
			// 	metadata: {
			// 		user_id: userId,
			// 		transaction_type: 'wallet_subscription',
			// 		amount: amount.toString(),
			// 		reference,
			// 	},
			// });

			// return updatedSubscription;

			const product = await stripe.products.create({
				name: `Wallet Top-Up for ${user.email}`,
			});

			const price = await stripe.prices.create({
				unit_amount: Math.round(amount * 100),
				currency: 'usd',
				recurring: { interval: 'month' },
				product: product.id,
				metadata: {
					user_id: userId,
					transaction_type: 'wallet_subscription',
					amount: amount.toString(),
					reference,
				},
			});

			// Return price ID and customer ID for Checkout to create the subscription
			return {
				priceId: price.id,
				customerId: stripeCustomerId,
			};
		} else {
			// One-time top-up flow (no change)
			const amountToPay = Math.round(amount * 100);
			const paymentIntent = await stripe.paymentIntents.create({
				amount: amountToPay,
				currency: 'usd',
				customer: stripeCustomerId,
				payment_method_types: ['card'],
				metadata: {
					user_id: userId,
					transaction_type: 'wallet_topup',
					amount: amount.toString(),
					reference,
					recurring: 'false',
				},
			});
			return paymentIntent;
		}
	}

	// Handle successful wallet top-up
	async handleWalletTopUp(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.metadata.transaction_type !== 'wallet_topup') {
			throw new AppError('Not a wallet top-up transaction');
		}

		//const recurringPayment = paymentIntent.metadata.recurring;
		const userId = paymentIntent.metadata.user_id;
		const reference = paymentIntent.metadata.reference;

		const amountInCents = paymentIntent.amount;
		const amountInDollars = amountInCents / 100;

		await this.db.transaction(async (trx) => {
			const wallet = await trx('wallets').where({ userId }).first();

			let walletBefore = 0;
			let newBalance = 0;

			if (!wallet) {
				await trx('wallets').insert({ userId, balance: amountInDollars });
				newBalance = amountInDollars;
			} else {
				walletBefore = wallet.balance;
				newBalance = walletBefore + amountInDollars;
				await trx('wallets').where({ id: wallet.id }).update({
					balance: newBalance,
					updated_at: new Date(),
				});
			}

			await trx('transactions')
				.where({ reference })
				.update({
					status: 'success',
					description: `$${amountInDollars} Credit`,
					walletBalanceBefore: walletBefore,
					walletBalanceAfter: newBalance,
				});

			// if (recurringPayment === 'true') {
			// 	await trx('wallet_topup_subscriptions').insert({
			// 		userId,
			// 		amount: amountInDollars,
			// 		currency: paymentIntent.currency,
			// 		stripeCustomerId: paymentIntent.customer,
			// 		reference,
			// 		nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
			// 	});
			// }

			await Notification.add({
				userId,
				title: 'Wallet Top-Up Successful',
				message: `Your wallet has been successfully topped up with $${amountInDollars}.`,
			});
		});
	}

	async handleProcessingPaymentForRecurring({
		userId,
		amount,
		reference
	}: {
		userId: string;
		amount: number;
		reference: string;
	}): Promise<void> {
		await this.db.transaction(async (trx) => {
			const wallet = await trx('wallets').where({ userId }).first();

			let walletBefore = 0;
			let newBalance = 0;

			if (!wallet) {
				await trx('wallets').insert({ userId, balance: amount });
				newBalance = amount;
			} else {
				walletBefore = wallet.balance;
				newBalance = walletBefore + amount;
				await trx('wallets').where({ id: wallet.id }).update({
					balance: newBalance,
					updated_at: new Date(),
				});
			}

			await trx('transactions')
				.where({ reference })
				.update({
					status: 'success',
					description: `$${amount} Credit`,
					walletBalanceBefore: walletBefore,
					walletBalanceAfter: newBalance,
				});

			await Notification.add({
				userId,
				title: 'Recurring Wallet Top-Up Successful',
				message: `Your wallet has been topped up with $${amount} from your subscription.`,
			});
		});
	}

	async handleFailedPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, transaction_type } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			// Record the failed transaction
			await trx('transactions').insert({
				userId: user_id,
				type: 'failed',
				amount: 0,
				status: 'failed',
				description: 'Payment failed',
				reference: referenceGenerator(),
				stripePaymentIntentId: paymentIntentId,
				metadata: {
					failure_reason: paymentIntent.last_payment_error?.message || 'Unknown failure reason',
					attempted_amount: paymentIntent.amount,
				},
			});

			// If this was a service payment, update the service status
			if (request_id) {
				await trx('requests').where({ id: request_id }).update({
					status: 'blocked',
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

	async handleFailedRecurringPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		const userId = paymentIntent.metadata?.user_id;
		const amount = paymentIntent.metadata?.amount;
		const reference = paymentIntent.metadata?.reference;

		console.warn(`Failed recurring payment for user ${userId}, amount: ${amount}, reference: ${reference}`);

		// Optional: log it to DB, flag subscription, or notify user
		await Notification.add({
			userId,
			title: 'Recurring Payment Failed',
			message: `Your recurring wallet top-up of $${amount} failed. Please update your payment method.`,
		});
	}

	async handleCanceledPayment(paymentIntentId: string): Promise<void> {
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		const { user_id, request_id, transaction_type } = paymentIntent.metadata;

		await this.db.transaction(async (trx) => {
			// Record the canceled transaction
			await trx('transactions').insert({
				userId: user_id,
				//USE FAILED INSTEAD
				type: 'request',
				reference: referenceGenerator(),
				description: 'Payment canceled',
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
					status: 'blocked',
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
