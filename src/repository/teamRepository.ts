import { knexDb } from '@/common/config';
import { ITeam, ITeamMember } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TeamRepository {
	createTeam = async (payload: Partial<ITeam>) => {
		return await knexDb.table('teams').insert(payload).returning('*');
	};

	getTeam = async (id: string): Promise<ITeam | null> => {
		const result = await knexDb.table('teams').where({ id }).select('*');
		return result.length ? result[0] : null;
	};

	getTeamByOwnerId = async (ownerId: string): Promise<ITeam | null> => {
		const result = await knexDb.table('teams').where({ ownerId }).select('*');
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

	getAllTeams = async (): Promise<ITeam[]> => {
		return await knexDb.table('teams').where({ isDeleted: false }).select('*');
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

	updateTeamMembers = async (teamId: string, payload: Partial<ITeam>): Promise<ITeam[]> => {
		return await knexDb
			.table('team_members')
			.where({ teamId })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	addTeamMember = async (payload: Partial<ITeamMember>): Promise<ITeamMember[]> => {
		return await knexDb.table('team_members').insert(payload).returning('*');
	};

	isUserMemberOfTeam = async (teamId: string, userId: string): Promise<boolean> => {
		const result = await knexDb.table('team_members').where({ teamId, memberId: userId }).select('*');
		return result.length > 0;
	};

	getAllTeamsWithMembers = async (): Promise<(ITeam & { members: ITeamMember[] })[]> => {
		const teams = await knexDb.table('teams').where({ isDeleted: false }).select('*');
		const teamIds = teams.map((team) => team.id);

		const members = await knexDb.table('team_members').whereIn('teamId', teamIds).select('*');

		return teams.map((team) => ({
			...team,
			members: members.filter((member) => member.teamId === team.id),
		}));
	};

	getTeamMember = async (teamId: string, userId: string): Promise<ITeamMember | null> => {
		const result = await knexDb.table('team_members').where({ teamId, memberId: userId }).select('*');
		return result.length ? result[0] : null;
	};

	findTeamsForUser = async (userId: string): Promise<ITeam[]> => {
		const teamIds = await knexDb.table('team_members').where({ memberId: userId }).select('teamId');

		if (teamIds.length === 0) {
			return [];
		}

		return await knexDb
			.table('teams')
			.whereIn(
				'id',
				teamIds.map((t) => t.teamId)
			)
			.andWhere({ isDeleted: false })
			.select('*');
	};

	getUserTeamsWithMemberCount = async (userId: string) => {
		return knexDb('team_members as tm')
			.select(
				'tm.teamId',
				't.name as teamName',
				knexDb.raw('COUNT(DISTINCT tm2.id) as memberCount'),
				knexDb.raw(`'team:' || "tm"."teamId" as roomId`)
			)
			.join('teams as t', 't.id', 'tm.teamId')
			.join('team_members as tm2', 'tm2.teamId', 'tm.teamId')
			.where('tm.memberId', userId)
			.andWhere('tm.isDeleted', false)
			.andWhere('tm2.isDeleted', false)
			.groupBy('tm.teamId', 't.name');
	};
}

export const teamRepository = new TeamRepository();
