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
		const { teamId, memberId, memberType } = payload;

		const [teamMember] = await teamRepository.addTeamMember({ teamId, memberId, memberType });
		if (!teamMember) {
			throw new AppError('Failed to add team member', 500);
		}

		//await this.setupClientManagerCommunication(teamId, memberId);
		return teamMember;
	}

	setupClientManagerCommunication = async (teamId, managerId) => {
		try {
			// Get the team owner (client)
			const team = await teamRepository.getTeam(teamId);
			if (!team) {
				throw new Error('Team not found');
			}

			// Create their chat room
			const roomId = getClientManagerRoomId(team.ownerId, managerId, teamId);
			await getOrCreateRoom(roomId, 'client-manager', {
				clientId: team.ownerId,
				managerId,
				teamId,
				createdAt: new Date(),
			});

			// Notify both users if they're online
			const io = global.io; // Make sure io is globally accessible
			console.log('io', io);
			if (io) {
				// Notify the manager
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
