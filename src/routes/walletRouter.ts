import { protect } from '@/middlewares/protect';
import express from 'express';
import { walletController } from '@/controllers';

const router = express.Router();

// Apply authentication middleware to all wallet routes
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
router.post('/service-payment', walletController.createServicePayment);
/**
 * @openapi
 * /wallet/topup:
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
router.post('/topup', walletController.createWalletTopUp);
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

export { router as walletRouter };
