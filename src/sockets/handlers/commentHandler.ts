import { Server, Socket } from 'socket.io';
import { SocketEvents } from '@/common/constants';
import { logger, sendNewCommentEmail } from '@/common/utils';
import { commentRepository, userRepository, requestsRepository, teamRepository } from '@/repository';
import { Activity } from '@/services/Activities';

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

			const user = await userRepository.findById(senderId);
			if (!user) {
				return socket.emit('error', { message: 'User not found' });
			}
			await Activity.add({
				userId: senderId,
				requestId,
				activity: 'Request Comment',
				activityDescription: `${user.firstName} ${user.lastName} added a new comment`,
			});

			const request = await requestsRepository.findById(requestId);
			if (!request) {
				return socket.emit('error', { message: 'Request not found' });
			}

			const [team] = await teamRepository.findTeamsForUser(request.userId);
			if (!team) {
				return socket.emit('error', { message: 'Team not found for the request' });
			}

			const requestLink = `https://app.expertlayer.co/dashboard/requests/${requestId}`;
			if (user.role === 'talent') {
				const teamMembers = await teamRepository.getTeamMembers(team.id);
				for (const member of teamMembers) {
					// Skip the sender
					if (member.memberId === senderId) continue;

					const memberUser = await userRepository.findById(member.memberId);
					if (!memberUser || !memberUser.email) continue;

					await sendNewCommentEmail(
						memberUser.email,
						memberUser.firstName,
						user.firstName,
						user.lastName,
						request.serviceName,
						requestLink
					);
				}
			} else {
				// Get talents for the request
				const talents = await requestsRepository.getTalentsForRequest(requestId);
				for (const talent of talents) {
					// Skip the sender if they are a talent
					if (talent.userId === senderId) continue;

					const talentUser = await userRepository.findById(talent.userId);
					if (!talentUser || !talentUser.email) continue;

					await sendNewCommentEmail(
						talentUser.email,
						talentUser.firstName,
						user.firstName,
						user.lastName,
						request.serviceName,
						requestLink
					);
				}

				// Notify other team members (excluding sender)
				const teamMembers = await teamRepository.getTeamMembers(team.id);
				for (const member of teamMembers) {
					if (member.memberId === senderId) continue;

					const memberUser = await userRepository.findById(member.memberId);
					if (!memberUser || !memberUser.email) continue;

					await sendNewCommentEmail(
						memberUser.email,
						memberUser.firstName,
						user.firstName,
						user.lastName,
						request.serviceName,
						requestLink
					);
				}
			}

			// if (member.userId !== senderId) {
			io.to(requestId).emit(SocketEvents.REQUEST_COMMENT, newComment);
		} catch (error) {
			logger.error(`Error saving comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
			socket.emit('error', { message: 'Failed to save comment' });
		}
	});
};
