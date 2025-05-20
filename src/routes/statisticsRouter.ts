import { statisticsController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);
router.get('/', statisticsController.findStats);

export { router as statisticsRouter };
