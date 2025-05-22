import { Server, Socket } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { logger } from '@/common/utils';
import { commentRepository } from '@/repository';

export const commentHandler = (io: Server, socket: Socket) => {
	const { id: senderId } = socket.data.user;

	// Handle sending a message
	socket.on(SocketEvents.REQUEST_COMMENT, async (data) => {
		console.log('Received comment data:', data);
		console.log('Sender ID:', senderId);
		try {
			const { comment, requestId } = data;

			if (!comment || !requestId) {
				return socket.emit('error', { message: 'Comment and requestId are required' });
			}

			const newComment = await commentRepository.create({
				userId: senderId,
				requestId,
				comment,
			});

			console.log('Comment saved:', newComment);
			io.to(requestId).emit(SocketEvents.REQUEST_COMMENT, newComment);
		} catch (error) {
			logger.error(`Error saving comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
			socket.emit('error', { message: 'Failed to save comment' });
		}
	});
};
