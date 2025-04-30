import { teamRepository } from '@/repository';

export const getUserTeamIds = async (userId: string): Promise<string[]> => {
	const teams = await teamRepository.findTeamsForUser(userId);
	return teams.map((team) => team.id);
};
