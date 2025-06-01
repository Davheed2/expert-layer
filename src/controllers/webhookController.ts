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

			switch (event.type) {
				case 'payment_intent.created': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('payment intent', paymentIntent);
					//console.log('Payment processing:', paymentIntent.id);
					await walletService.handleProcessingPayment(paymentIntent.id);
					break;
				}

				case 'invoice.created': {
					const invoice = event.data.object as Stripe.Invoice;
					console.log('invoice intent', invoice);
					// if (invoice.id) {
					// 	await walletService.handleInvoiceProcessingPayment(invoice.id);
					// } else {
					// 	console.warn('invoice.id is null, skipping handleProcessingPayment');
					// }
					break;
				}

				case 'payment_intent.succeeded': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment succeeded:', paymentIntent.id);

					const { transaction_type, user_id, amount } = paymentIntent.metadata || {};
					if (transaction_type === 'wallet_topup') {
						await walletService.handleWalletTopUp(paymentIntent.id);
					} else if (transaction_type === 'wallet_subscription') {
						if (!user_id || !amount) {
							console.warn('Missing metadata for wallet subscription:', paymentIntent.id);
							break;
						}
					} else if (paymentIntent.metadata.request_id) {
						await walletService.handleSuccessfulPayment(paymentIntent.id);
					}
					break;
				}

				case 'checkout.session.completed': {
					const session = event.data.object as Stripe.Checkout.Session;
					console.log('Checkout session completed:', session.id);

					if (session.mode === 'subscription' && session.subscription) {
						const { user_id, transaction_type, amount } = session.metadata || {};

						if (transaction_type === 'wallet_subscription') {
							if (!user_id || !amount) {
								console.warn('Missing metadata in checkout session:', session.id);
								break;
							}

							// Optionally update subscription with metadata for future invoices
							// await stripe.subscriptions.update(session.subscription as string, {
							// 	metadata: {
							// 		user_id,
							// 		transaction_type: 'wallet_subscription',
							// 		amount,
							// 		reference,
							// 	},
							// });

							// Handle initial subscription payment
							// await walletService.handleProcessingPaymentForRecurring({
							// 	userId: user_id,
							// 	amount: Number(amount),
							// });

							console.log(`Initial wallet credit from subscription. Session: ${session.id}`);
						}
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
					console.log('Invoice payment succeeded:', invoice);

					if (invoice.id) {
						await walletService.handleProcessingPaymentForRecurring(invoice.id);
					} else {
						console.warn('invoice.id is null, skipping handleProcessingPayment');
					}

					// if (invoice.subscription) {
					// 	const subscription = await stripe.subscriptions.retrieve(invoice.subscription, {
					// 		expand: ['customer'], // Optional: expand customer if needed
					// 	});

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
