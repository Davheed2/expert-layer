import { protect } from '@/middlewares/protect';
import express from 'express';
import { walletController } from '@/controllers';

const router = express.Router();

router.use(protect);

// Wallet routes

/**
 * @openapi
 * /wallet/create:
 *   post:
 *     summary: Create a wallet
 *     description: Allows a logged-in user to create a wallet or retrieve their existing wallet balance. The endpoint validates the user’s login status and fetches or initializes the wallet balance for the user.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: number
 *                       example: 0
 *                       description: The wallet balance of the user
 *                 message:
 *                   type: string
 *                   example: "Wallet created successfully"
 *       400:
 *         description: Bad Request - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.post('/create', walletController.createWallet);
/**
 * @openapi
 * /wallet/balance:
 *   get:
 *     summary: Retrieve wallet balance
 *     description: Allows a logged-in user to retrieve their wallet balance. The endpoint validates the user’s login status and fetches the current balance from the wallet service.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 0
 *                       description: The current wallet balance of the user
 *                 message:
 *                   type: string
 *                   example: "Wallet balance retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.get('/balance', walletController.getWalletBalance);
/**
 * @openapi
 * /wallet/service-payment:
 *   post:
 *     summary: Create a service payment
 *     description: Allows a logged-in user to initiate a payment for a service. The endpoint validates the user’s login status and service ID, checks the user’s wallet balance, and processes the payment from the wallet if sufficient funds are available. If the wallet balance is insufficient, it creates a Stripe payment intent for the remaining amount.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: "1bcc34b7-0070-449a-a12c-7beb843eb001"
 *                 description: The ID of the service to pay for
 *     responses:
 *       200:
 *         description: Payment processed or payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         clientSecret:
 *                           type: string
 *                           example: "pi_3RFxeHHcGMFg3fwv0vRLGrhM_secret_NCNTFXsF00Lx4mhc0TUXNleVq"
 *                           description: The client secret for the Stripe payment intent
 *                         paymentMethod:
 *                           type: string
 *                           example: "stripe"
 *                           description: The payment method used
 *                         amountToCharge:
 *                           type: number
 *                           example: 1000
 *                           description: The amount to charge via Stripe
 *                         walletAmountUsed:
 *                           type: number
 *                           example: 0
 *                           description: The amount used from the wallet
 *                     - type: object
 *                       description: Transaction details when payment is processed from wallet
 *                 message:
 *                   type: string
 *                   example: "Payment intent created successfully"
 *                   enum:
 *                     - Payment processed successfully from wallet
 *                     - Payment intent created successfully
 *       400:
 *         description: Bad Request - User not logged in or missing service ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 *       404:
 *         description: Not Found - Service not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Service not found"
 */
router.post('/service-payment', walletController.createRequestPayment);
/**
 * @openapi
 * /wallet/fund:
 *   post:
 *     summary: Create a wallet top-up payment intent
 *     description: Allows a logged-in user to initiate a wallet top-up by specifying an amount. The endpoint validates the user’s login status, ensures a valid positive amount is provided, and creates a Stripe payment intent for the top-up.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2000
 *                 description: The amount to top up the wallet (in cents)
 *     responses:
 *       200:
 *         description: Top-up payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientSecret:
 *                       type: string
 *                       example: "pi_3RFxgaHcGMFg3fwv1NBdttw6_secret_hPyYuFSx8628d7sWDkWN8IsLo"
 *                       description: The client secret for the Stripe payment intent
 *                     amount:
 *                       type: number
 *                       example: 2000
 *                       description: The amount of the top-up (in cents)
 *                 message:
 *                   type: string
 *                   example: "Top-up payment intent created successfully"
 *       400:
 *         description: Bad Request - User not logged in or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 *                   enum:
 *                     - Please log in again
 *                     - Invalid amount
 */
router.post('/fund', walletController.createWalletTopUp);
/**
 * @openapi
 * /wallet/transactions:
 *   get:
 *     summary: Retrieve transaction history
 *     description: Allows a logged-in user to retrieve their transaction history. The endpoint validates the user’s login status and fetches up to the 50 most recent transactions for the user, ordered by creation date in descending order.
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: The ID of the transaction
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         description: The ID of the user who made the transaction
 *                       amount:
 *                         type: number
 *                         description: The amount of the transaction
 *                       type:
 *                         type: string
 *                         description: The type of transaction (e.g., wallet_topup, service_payment)
 *                       status:
 *                         type: string
 *                         description: The status of the transaction
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time the transaction was created
 *                 message:
 *                   type: string
 *                   example: "Transaction history retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.get('/transactions', walletController.getTransactionHistory);

/**
 * @openapi
 * /wallet/subscriptions:
 *   get:
 *     summary: Retrieve user subscriptions
 *     description: Allows a logged-in user to retrieve their subscription history. The endpoint validates the user’s login status and fetches the user’s subscriptions, including details such as status, amount, currency, and billing information, ordered by creation date.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: The ID of the subscription
 *                           status:
 *                             type: string
 *                             description: The status of the subscription (e.g., active, incomplete_expired)
 *                           amount:
 *                             type: number
 *                             description: The amount of the subscription in the smallest currency unit (e.g., cents for USD)
 *                           currency:
 *                             type: string
 *                             description: The currency of the subscription (e.g., usd)
 *                           interval:
 *                             type: string
 *                             description: The billing interval of the subscription (e.g., month, year)
 *                           next_billing_date:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time of the next billing attempt
 *                           cancel_at_period_end:
 *                             type: boolean
 *                             description: Indicates if the subscription will cancel at the end of the current period
 *                           canceled_at:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time the subscription was canceled, if applicable
 *                             nullable: true
 *                           created:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time the subscription was created
 *                           product_name:
 *                             type: string
 *                             description: The name of the product associated with the subscription
 *                           next_payment_attempt:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time of the next payment attempt, if applicable
 *                             nullable: true
 *                 message:
 *                   type: string
 *                   example: "Subscriptions retrieved successfully"
 *                 isImpersonating:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if the request was made in an impersonation context
 *       400:
 *         description: Bad Request - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.get('/subscriptions', walletController.getUserSubscriptions);
/**
 * @openapi
 * /wallet/subscription:
 *   get:
 *     summary: Retrieve a specific subscription
 *     description: Allows a logged-in user to retrieve details of a specific subscription by providing a subscription ID. The endpoint validates the user’s login status and the presence of the subscription ID, then fetches the subscription details including status, amount, currency, and billing information.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subscriptionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription to retrieve
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           description: The ID of the subscription
 *                         status:
 *                           type: string
 *                           description: The status of the subscription (e.g., active, incomplete_expired)
 *                         amount:
 *                           type: number
 *                           description: The amount of the subscription in the smallest currency unit (e.g., cents for USD)
 *                         currency:
 *                           type: string
 *                           description: The currency of the subscription (e.g., usd)
 *                         interval:
 *                           type: string
 *                           description: The billing interval of the subscription (e.g., month, year)
 *                         next_billing_date:
 *                           type: string
 *                           format: date-time
 *                           description: The date and time of the next billing attempt
 *                         cancel_at_period_end:
 *                           type: boolean
 *                           description: Indicates if the subscription will cancel at the end of the current period
 *                         canceled_at:
 *                           type: string
 *                           format: date-time
 *                           description: The date and time the subscription was canceled, if applicable
 *                           nullable: true
 *                         created:
 *                           type: string
 *                           format: date-time
 *                           description: The date and time the subscription was created
 *                         product_name:
 *                           type: string
 *                           description: The name of the product associated with the subscription
 *                         default_payment_method:
 *                           type: object
 *                           properties:
 *                             brand:
 *                               type: string
 *                               description: The brand of the card (e.g., visa)
 *                             last4:
 *                               type: string
 *                               description: The last 4 digits of the card
 *                             exp_month:
 *                               type: integer
 *                               description: The expiration month of the card
 *                             exp_year:
 *                               type: integer
 *                               description: The expiration year of the card
 *                 message:
 *                   type: string
 *                   example: "Subscription retrieved successfully"
 *                 isImpersonating:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if the request was made in an impersonation context
 *       400:
 *         description: Bad Request - User not logged in or subscription ID missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.get('/subscription', walletController.getSubscription);

/**
 * @openapi
 * /wallet/subscription-cancel:
 *   post:
 *     summary: Cancel a subscription
 *     description: Allows a logged-in user to cancel a specific subscription. The endpoint validates the user’s login status and the presence of the subscription ID, then cancels the subscription either immediately or at the end of the current billing period based on the cancelImmediately flag.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 description: The ID of the subscription to cancel
 *               cancelImmediately:
 *                 type: boolean
 *                 description: Indicates whether to cancel the subscription immediately (true) or at the end of the current billing period (false)
 *                 default: false
 *     responses:
 *       200:
 *         description: Subscription canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionId:
 *                       type: string
 *                       format: uuid
 *                       description: The ID of the canceled subscription
 *                     status:
 *                       type: string
 *                       description: The current status of the subscription (e.g., canceled if canceled immediately, active if pending cancellation)
 *                     cancel_at_period_end:
 *                       type: boolean
 *                       description: Indicates if the subscription will cancel at the end of the current billing period
 *                 message:
 *                   type: string
 *                   description: A message describing the cancellation outcome
 *                   examples:
 *                     immediate:
 *                       value: "Subscription canceled immediately"
 *                     periodEnd:
 *                       value: "Subscription will be canceled at the end of the current billing period"
 *                 isImpersonating:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if the request was made in an impersonation context
 *       400:
 *         description: Bad Request - User not logged in or subscription ID missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.post('/subscription-cancel', walletController.cancelSubscription);

router.post('/subscription-reactivate', walletController.reactivateSubscription);

/**
 * @openapi
 * /wallet/subscription/update-amount:
 *   post:
 *     summary: Update subscription amount
 *     description: Allows a logged-in user to update the amount of a specific subscription. The endpoint validates the user’s login status, the presence of the subscription ID, and the validity of the new amount, then updates the subscription amount.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionId
 *               - amount
 *             properties:
 *               subscriptionId:
 *                 type: string
 *                 description: The ID of the subscription to update
 *               amount:
 *                 type: number
 *                 description: The new amount for the subscription (must be greater than 0)
 *     responses:
 *       200:
 *         description: Subscription amount updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscriptionId:
 *                       type: string
 *                       format: uuid
 *                       description: The ID of the updated subscription
 *                     newAmount:
 *                       type: number
 *                       description: The new amount of the subscription in the currency's smallest unit (e.g., dollars for USD)
 *                     status:
 *                       type: string
 *                       description: The current status of the subscription (e.g., active)
 *                 message:
 *                   type: string
 *                   example: "Subscription amount updated successfully"
 *                 isImpersonating:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if the request was made in an impersonation context
 *       400:
 *         description: Bad Request - User not logged in, subscription ID missing, or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.post('/subscription/update-amount', walletController.updateSubscriptionAmount);

/**
 * @openapi
 * /wallet/subscription-invoices:
 *   get:
 *     summary: Retrieve subscription invoices
 *     description: Allows a logged-in user to retrieve invoices for a specific subscription. The endpoint validates the user’s login status and the presence of the subscription ID, then fetches invoices with pagination, including details like amount, status, and period.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subscriptionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription to retrieve invoices for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The maximum number of invoices to return (1 to 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The number of invoices to skip for pagination
 *     responses:
 *       200:
 *         description: Billing history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The ID of the invoice
 *                           amount_paid:
 *                             type: number
 *                             description: The amount paid for the invoice in the currency's smallest unit (e.g., dollars for USD)
 *                           amount_due:
 *                             type: number
 *                             description: The amount due for the invoice in the currency's smallest unit (e.g., dollars for USD)
 *                           currency:
 *                             type: string
 *                             description: The currency of the invoice (e.g., usd)
 *                           status:
 *                             type: string
 *                             description: The status of the invoice (e.g., paid, open)
 *                           created:
 *                             type: string
 *                             format: date-time
 *                             description: The date and time the invoice was created
 *                           period_start:
 *                             type: string
 *                             format: date-time
 *                             description: The start date and time of the billing period
 *                           period_end:
 *                             type: string
 *                             format: date-time
 *                             description: The end date and time of the billing period
 *                           paid:
 *                             type: boolean
 *                             description: Indicates if the invoice has been paid
 *                           hosted_invoice_url:
 *                             type: string
 *                             description: URL to view the invoice on Stripe's hosted page
 *                           invoice_pdf:
 *                             type: string
 *                             description: URL to download the invoice as a PDF
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                           description: The maximum number of invoices returned
 *                         offset:
 *                           type: integer
 *                           description: The number of invoices skipped
 *                         hasMore:
 *                           type: boolean
 *                           description: Indicates if more invoices are available beyond the current page
 *                         count:
 *                           type: integer
 *                           description: The number of invoices in the current response
 *                 message:
 *                   type: string
 *                   example: "Billing history retrieved successfully"
 *                 isImpersonating:
 *                   type: boolean
 *                   example: false
 *                   description: Indicates if the request was made in an impersonation context
 *       400:
 *         description: Bad Request - User not logged in or subscription ID missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in again"
 */
router.get('/subscription-invoices', walletController.getSubscriptionInvoices);

export { router as walletRouter };
