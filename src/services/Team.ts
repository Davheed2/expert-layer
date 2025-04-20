import { ITeam, ITeamMember } from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { teamRepository } from '@/repository';

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
		return teamMember;
	}
}

export const Team = new TeamService();
