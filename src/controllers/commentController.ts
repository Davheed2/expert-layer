import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { commentRepository } from '@/repository';

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

	findByRequestId = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const comment = await commentRepository.getByRequestId(requestId as string);
		if (!comment) throw new AppError('No comment Found', 404);

		return AppResponse(res, 200, toJSON(comment), 'Comments retrieved successfully', req);
	});
}

export const commentController = new CommentController();
