import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { getRoomConversations } from '@/sockets/services/roomService';

export class MessageController {
	getMessagesByTeam = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { teamId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!teamId) {
			throw new AppError('Team ID is required', 400);
		}

		// const pageSize = parseInt(perPage as string, 10) || 10;
		// const pageNum = parseInt(page as string, 10) || 1;

		// const offset = (pageNum - 1) * pageSize;
		// const limit = pageSize;

		//const messages = await messageRepository.getMessagesByTeamId(teamId as string, limit, offset);
		const roomId = `team:${teamId}`;
		const messages = await getRoomConversations(roomId);
		if (!messages) {
			throw new AppError('No messages found', 404);
		}

		return AppResponse(res, 200, toJSON(messages), 'Messages retrieved successfully', req);
	});
}

export const messageController = new MessageController();
