import { Request, Response } from 'express';
import Stripe from 'stripe';
import { WalletService } from '@/services/Wallet';
import { knexDb as db, ENVIRONMENT } from '@/common/config';

const stripe = new Stripe(ENVIRONMENT.STRIPE_WEBHOOK_SECRET as string, {
	apiVersion: '2025-03-31.basil',
});

export class StripeWebhookController {
	handleWebhook = async (req: Request, res: Response) => {
		const walletService = new WalletService(db);
		const sig = req.headers['stripe-signature'] as string;

		try {
			const event = stripe.webhooks.constructEvent(req.body, sig, ENVIRONMENT.STRIPE_WEBHOOK_SECRET as string);

			// Handle different event types
			switch (event.type) {
				case 'payment_intent.created': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment processing:', paymentIntent.id);
					await walletService.handleProcessingPayment(paymentIntent.id);
					break;
				}

				case 'payment_intent.succeeded': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment succeeded:', paymentIntent.id);

					const { transaction_type, user_id, reference, amount } = paymentIntent.metadata || {};

					if (transaction_type === 'wallet_topup') {
						await walletService.handleWalletTopUp(paymentIntent.id);
					} else if (transaction_type === 'wallet_subscription') {
						console.log('wallet_subscription reference', reference);
						if (!user_id || !reference || !amount) {
							console.warn('Missing metadata for wallet subscription:', paymentIntent.id);
							break;
						}

						// Convert amount from cents to dollars
						const amountInDollars = Number(paymentIntent.amount) / 100;

						await walletService.handleProcessingPaymentForRecurring({
							userId: user_id,
							amount: amountInDollars,
							reference,
							stripePaymentIntentId: paymentIntent.id, // Add this for tracking
						});
					} else if (paymentIntent.metadata.request_id) {
						await walletService.handleSuccessfulPayment(paymentIntent.id);
					}
					break;
				}

				case 'payment_intent.payment_failed': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment failed:', paymentIntent.id);
					await walletService.handleFailedPayment(paymentIntent.id);
					break;
				}

				case 'payment_intent.canceled': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment canceled:', paymentIntent.id);
					await walletService.handleCanceledPayment(paymentIntent.id);
					break;
				}

				case 'invoice.payment_succeeded': {
					const invoice = event.data.object as Stripe.Invoice & {
						subscription?: string;
						payment_intent?: string;
					};
					console.log('Invoice payment succeeded:', invoice.id);

					// For subscription invoices, get metadata from the subscription
					if (invoice.subscription) {
						const subscription = await stripe.subscriptions.retrieve(invoice.subscription!);
						const { user_id, transaction_type, amount, reference } = subscription.metadata || {};

						if (transaction_type === 'wallet_subscription') {
							console.log('Processing subscription payment for invoice:', invoice.id);

							if (!user_id || !reference || !amount) {
								console.warn('Missing subscription metadata for invoice:', invoice.id);
								break;
							}

							await walletService.handleProcessingPaymentForRecurring({
								userId: user_id,
								amount: Number(amount),
								reference,
								stripePaymentIntentId: invoice.id,
							});

							console.log(`Wallet credited from recurring subscription. Invoice: ${invoice.id}`);
						}
					} else if (invoice.payment_intent) {
						// Fallback: non-subscription payment (one-time wallet top-up)
						await walletService.handleWalletTopUp(invoice.payment_intent!);
						console.log(`Wallet credited from one-time top-up. PaymentIntent: ${invoice.payment_intent}`);
					}
					break;
				}

				// case 'charge.refunded': {
				// 	const charge = event.data.object as Stripe.Charge;
				// 	console.log('Charge refunded:', charge.id);
				// 	await walletService.handleRefund(charge.payment_intent as string);
				// 	break;
				// }

				case 'invoice.payment_failed': {
					const invoice = event.data.object as Stripe.Invoice & { payment_intent?: string };
					const paymentIntentId = invoice.payment_intent;

					if (paymentIntentId) {
						console.warn(`Recurring payment failed for PaymentIntent ${paymentIntentId}`);
						// Optional: Notify user or update DB to flag subscription issue
						await walletService.handleFailedRecurringPayment(paymentIntentId);
					}
					break;
				}

				default:
					console.log(`Unhandled event type ${event.type}`);
			}

			res.json({ received: true });
		} catch (err) {
			console.error('Error processing webhook:', err);
			if (err instanceof Error) {
				res.status(400).send(`Webhook Error: ${err.message}`);
			} else {
				res.status(400).send('Webhook Error: An unknown error occurred');
			}
		}
	};
}

export const stripeWebhookController = new StripeWebhookController();
