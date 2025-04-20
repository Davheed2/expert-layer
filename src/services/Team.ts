import { ITeam } from '@/common/interfaces';
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
}

export const Team = new TeamService();
