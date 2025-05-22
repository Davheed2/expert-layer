import { protect } from '@/middlewares/protect';
import express from 'express';
import { commentController } from '@/controllers';
import { multerUpload } from '@/common/config';

const router = express.Router();

router.use(protect);

router.post('/image', multerUpload.single('commentImage'), commentController.convertImageToUploadString);

export { router as commentRouter };
