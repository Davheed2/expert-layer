import { requestsController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);
router.post('/create', requestsController.createRequest);
router.get('/user', requestsController.findByUserId);
router.get('/get-request', requestsController.findRequestById);
router.post('/update/:id', requestsController.updateRequest);

export { router as requestRouter };
