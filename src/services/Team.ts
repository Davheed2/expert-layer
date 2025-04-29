import { ITeam, ITeamMember } from '@/common/interfaces';
import { AppError, logger } from '@/common/utils';
import { teamRepository } from '@/repository';
import { getClientManagerRoomId, getOrCreateRoom } from '@/sockets/services/roomService';

interface ExtendedSocket {
	id: string;
	data: {
		user?: {
			id: string;
		};
	};
}

class TeamService {
	async add(payload: Partial<ITeam>): Promise<ITeam> {
		const { name, ownerId } = payload;

		const [team] = await teamRepository.createTeam({ name, ownerId });
		if (!team) {
			throw new AppError('Failed to create team', 500);
		}
		return team;
	}

	async addMember(payload: Partial<ITeamMember>): Promise<ITeamMember> {
		const { teamId, ownerId, memberId, memberType } = payload;

		const [teamMember] = await teamRepository.addTeamMember({ teamId, ownerId, memberId, memberType });
		if (!teamMember) {
			throw new AppError('Failed to add team member', 500);
		}

		if (teamId && memberId && memberType) {
			await this.setupClientManagerCommunication(teamId, memberId, memberType);
		} else {
			throw new AppError('Invalid team member data', 400);
		}
		return teamMember;
	}

	setupClientManagerCommunication = async (teamId: string, managerId: string, memberType: string) => {
		try {
			// Check if the memberType is 'accountmanager' to determine if it's a manager
			const isManager = memberType === 'accountmanager';

			// Get the team owner (client)
			const team = await teamRepository.getTeam(teamId);
			if (!team) {
				throw new Error('Team not found');
			}

			// Create their chat room
			const roomId = getClientManagerRoomId(teamId);
			await getOrCreateRoom(roomId, 'team', {
				clientId: team.ownerId,
				managerId,
				teamId,
				createdAt: new Date(),
			});

			// Notify both users if they're online
			const io = global.io; // Make sure io is globally accessible
			if (io) {
				// Notify the manager if it's an account manager
				if (isManager) {
					const managerSocket = Array.from(io.sockets.sockets.values()).find((s) => {
						const socket = s as unknown as ExtendedSocket;
						return socket.data?.user?.id === managerId;
					}) as ExtendedSocket | undefined;

					const managerSocketId = managerSocket?.id;

					if (managerSocketId) {
						io.to(managerSocketId).emit('new_client_assigned', {
							clientId: team.ownerId,
							teamId,
						});
					}
				}

				// Notify the client
				const clientSocket = Array.from(io.sockets.sockets.values()).find((s) => {
					const socket = s as unknown as ExtendedSocket;
					return socket.data?.user?.id === team.ownerId;
				}) as ExtendedSocket | undefined;

				const clientSocketId = clientSocket?.id;

				if (clientSocketId) {
					io.to(clientSocketId).emit('new_manager_assigned', {
						managerId,
						teamId,
					});
				}
			}

			return true;
		} catch (error) {
			if (error instanceof Error) {
				logger.error(`Error setting up client-manager communication: ${error.message}`);
			} else {
				logger.error('Error setting up client-manager communication: An unknown error occurred');
			}
			throw error;
		}
	};
}

export const Team = new TeamService();
