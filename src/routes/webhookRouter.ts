import { stripeWebhookController } from '@/controllers';

import express from 'express';

const router = express.Router();

// Webhook routes
router.post('/stripe', stripeWebhookController.handleWebhook);

export { router as webhookRouter };
