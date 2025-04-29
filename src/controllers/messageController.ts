import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { messageRepository } from '@/repository';

export class MessageController {
	getMessagesByTeam = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { perPage, page, roomId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!roomId) {
			throw new AppError('Team ID is required', 400);
		}

		const pageSize = parseInt(perPage as string, 10) || 10;
		const pageNum = parseInt(page as string, 10) || 1;

		const offset = (pageNum - 1) * pageSize;
		const limit = pageSize;

		const messages = await messageRepository.getMessagesByRoomId(roomId as string, limit, offset);
		if (!messages) {
			throw new AppError('No messages found', 404);
		}

		return AppResponse(res, 200, toJSON(messages), 'Messages retrieved successfully', req);
	});
}

export const messageController = new MessageController();
