import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';

export class CommentController {
	convertImageToUploadString = catchAsync(async (req: Request, res: Response) => {
		const { user, file } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!file) {
			throw new AppError('File is required', 400);
		}

		const { secureUrl } = await uploadPictureFile({
			fileName: `comment-image/${Date.now()}-${file.originalname}`,
			buffer: file.buffer,
			mimetype: file.mimetype,
		});
		if (!secureUrl) {
			throw new AppError('Failed to upload image', 500);
		}

		return AppResponse(res, 200, toJSON({ secureUrl }), 'Image uploaded successfully', req);
	});
}

export const commentController = new CommentController();
