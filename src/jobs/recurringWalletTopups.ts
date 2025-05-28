// cron/recurringWalletTopups.ts

import Stripe from 'stripe';
import { knexDb as db, ENVIRONMENT } from '@/common/config';
import { referenceGenerator } from '@/common/utils';

const stripe = new Stripe(ENVIRONMENT.STRIPE_SECRET_KEY as string, {
	apiVersion: '2025-03-31.basil',
});

export const processRecurringWalletTopUps = async () => {
	const now = new Date();

	const subscriptions = await db('wallet_topup_subscriptions')
		.where('status', 'active')
		.andWhere('nextBillingDate', '<=', now);

	for (const sub of subscriptions) {
		try {
			const reference = referenceGenerator();

			await stripe.paymentIntents.create({
				amount: sub.amount,
				currency: sub.currency,
				customer: sub.stripeCustomerId,
				off_session: true,
				confirm: true,
				metadata: {
					user_id: sub.userId,
					transaction_type: 'wallet_topup',
					recurring: 'true',
					reference,
				},
			});

			// The webhook will handle top-up success and apply wallet changes

			await db('wallet_topup_subscriptions')
				.where({ id: sub.id })
				.update({
					nextBillingDate: new Date(new Date().setMonth(now.getMonth() + 1)),
					updated_at: new Date(),
				});
		} catch (err) {
			console.error(`Failed to process recurring top-up for user ${sub.userId}:`, err);
			// Optional: Notify user or flag in a "failures" table
		}
	}
};
