import { protect } from '@/middlewares/protect';
import express from 'express';
import { messageController } from '@/controllers';

const router = express.Router();

router.use(protect);

router.get('/team', messageController.getMessagesByTeam);

export { router as messageRouter };
