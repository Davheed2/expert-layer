import { protect } from '@/middlewares/protect';
import express from 'express';
import { activityController } from '@/controllers';

const router = express.Router();

router.use(protect);

router.get('/request', activityController.findByRequestId);

export { router as activityRouter };
