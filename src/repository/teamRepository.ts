import { knexDb } from '@/common/config';
import { ITeam } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TeamRepository {
	createTeam = async (payload: Partial<ITeam>) => {
		return await knexDb.table('teams').insert(payload).returning('*');
	};

	getTeam = async (id: string): Promise<ITeam | null> => {
		const result = await knexDb.table('teams').where({ id }).select('*');
		return result.length ? result[0] : null;
	};

	// getAllTeams = async (): Promise<ITeamWithOwner[]> => {
	// 	return await knexDb
	// 		.table('teams')
	// 		.join('users', 'teams.ownerId', 'users.id')
	// 		.select('teams.*', 'users.firstName', 'users.lastName', 'users.photo')
	// 		.where('teams.isDeleted', false)
	// 		.orderBy('teams.created_at', 'desc');
	// };

	getTeamByName = async (ownerId: string, name: string): Promise<ITeam | null> => {
		return await knexDb.table('teams').where({ ownerId, name }).first();
	};

	getUserTeams = async (ownerId: string): Promise<ITeam[]> => {
		return await knexDb.table('teams').where({ ownerId }).andWhere({ isDeleted: false }).select('*');
	};

	deleteTeam = async (teamId: string) => {
		return await knexDb.table('teams').where({ id: teamId }).update({ isDeleted: true }).returning('*');
	};

	updateTeam = async (id: string, payload: Partial<ITeam>): Promise<ITeam[]> => {
		return await knexDb
			.table('teams')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};
}

export const teamRepository = new TeamRepository();
