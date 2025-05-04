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
				case 'payment_intent.succeeded': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment succeeded:', paymentIntent.id);

					if (paymentIntent.metadata.transaction_type === 'wallet_topup') {
						await walletService.handleWalletTopUp(paymentIntent.id);
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

				case 'payment_intent.processing': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment processing:', paymentIntent.id);
					await walletService.handleProcessingPayment(paymentIntent.id);
					break;
				}

				case 'payment_intent.canceled': {
					const paymentIntent = event.data.object as Stripe.PaymentIntent;
					console.log('Payment canceled:', paymentIntent.id);
					await walletService.handleCanceledPayment(paymentIntent.id);
					break;
				}

				// case 'charge.refunded': {
				// 	const charge = event.data.object as Stripe.Charge;
				// 	console.log('Charge refunded:', charge.id);
				// 	await walletService.handleRefund(charge.payment_intent as string);
				// 	break;
				// }

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
