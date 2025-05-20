import { protect } from '@/middlewares/protect';
import express from 'express';
import { transactionController } from '@/controllers';

const router = express.Router();

router.use(protect);

router.get('/user', transactionController.findByUserId);

export { router as transactionRouter };
