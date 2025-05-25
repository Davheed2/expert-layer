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

	getUserTeamWithMemberCount = async (teamId: string, userId: string) => {
		const team = await knexDb('teams as t')
			.select('t.id as teamId', 't.name as teamName')
			.where('t.id', teamId)
			.andWhere('t.isDeleted', false)
			.first();

		if (!team) {
			return null;
		}

		const teamMembers = await knexDb('team_members as tm')
			.select('tm.teamId', 'tm.memberId', 'tm.memberType')
			.where('tm.teamId', teamId)
			.andWhere('tm.isDeleted', false);

		const userMembership = teamMembers.find((member) => member.memberId === userId);

		return {
			...team,
			memberCount: teamMembers.length,
			roomId: `team:${team.teamId}`,
			isMember: !!userMembership,
			memberType: userMembership ? userMembership.memberType : null,
		};
	};

	getUserTeamsWithMemberCount = async (userId: string) => {
		const teams = await knexDb('teams as t').select('t.id as teamId', 't.name as teamName').where('t.isDeleted', false);

		const teamMembers = await knexDb('team_members as tm')
			.select('tm.teamId', 'tm.memberId', 'tm.memberType')
			.where('tm.isDeleted', false);

		// Get unique memberIds to fetch user info in one query
		const memberIds = [...new Set(teamMembers.map((m) => m.memberId))];
		const users = await knexDb('users').whereIn('id', memberIds).select('id', 'firstName', 'lastName');

		return teams.map((team) => {
			const membersForTeam = teamMembers.filter((member) => member.teamId === team.teamId);
			const membersWithNames = membersForTeam.map((member) => {
				const user = users.find((u) => u.id === member.memberId);
				return {
					memberId: member.memberId,
					firstName: user ? user.firstName : null,
					lastName: user ? user.lastName : null,
					memberType: member.memberType,
				};
			});
			const userMembership = membersWithNames.find((member) => member.memberId === userId);

			return {
				...team,
				memberCount: membersWithNames.length,
				roomId: `team:${team.teamId}`,
				isMember: !!userMembership,
				memberType: userMembership ? userMembership.memberType : null,
				members: membersWithNames,
			};
		});
	};

	getManagerTeamsWithMemberCount = async (userId: string) => {
		const teams = await knexDb('teams as t')
			.select('t.id as teamId', 't.name as teamName')
			.join('team_members as tm', 'tm.teamId', 't.id')
			.where('tm.memberId', userId)
			.andWhere('t.ownerId', '!=', userId)
			.andWhere('t.isDeleted', false);

		const teamMembers = await knexDb('team_members as tm')
			.select('tm.teamId', 'tm.memberId', 'tm.memberType')
			.where('tm.isDeleted', false);

		// Get unique memberIds to fetch user info in one query
		const memberIds = [...new Set(teamMembers.map((m) => m.memberId))];
		const users = await knexDb('users').whereIn('id', memberIds).select('id', 'firstName', 'lastName');

		return teams.map((team) => {
			const membersForTeam = teamMembers.filter((member) => member.teamId === team.teamId);
			const membersWithNames = membersForTeam.map((member) => {
				const user = users.find((u) => u.id === member.memberId);
				return {
					memberId: member.memberId,
					firstName: user ? user.firstName : null,
					lastName: user ? user.lastName : null,
					memberType: member.memberType,
				};
			});
			const userMembership = membersWithNames.find((member) => member.memberId === userId);

			return {
				...team,
				memberCount: membersWithNames.length,
				roomId: `team:${team.teamId}`,
				isMember: !!userMembership,
				memberType: userMembership ? userMembership.memberType : null,
				members: membersWithNames,
			};
		});
	};

	getClientTeamMembers = async (userId: string) => {
		const teams = await knexDb('teams as t')
			.select('t.id as teamId', 't.name as teamName')
			.where('t.ownerId', userId)
			.andWhere('t.isDeleted', false);

		const teamIds = teams.map((team) => team.teamId);

		if (teamIds.length === 0) return [];

		// Step 2: Get team members where team.ownerId = userId and memberId != ownerId
		const teamMembers = await knexDb('team_members as tm')
			.select('tm.teamId', 'tm.memberId', 'tm.memberType')
			.whereIn('tm.teamId', teamIds)
			.andWhereNot('tm.memberId', userId)
			.andWhere('tm.isDeleted', false);

		// Get unique memberIds to fetch user info in one query
		const memberIds = [...new Set(teamMembers.map((m) => m.memberId))];
		const users = memberIds.length
			? await knexDb('users').whereIn('id', memberIds).select('id', 'firstName', 'lastName')
			: [];

		return teams.map((team) => {
			const membersForTeam = teamMembers.filter((member) => member.teamId === team.teamId);
			const membersWithNames = membersForTeam.map((member) => {
				const user = users.find((u) => u.id === member.memberId);
				return {
					memberId: member.memberId,
					firstName: user ? user.firstName : null,
					lastName: user ? user.lastName : null,
					memberType: member.memberType,
				};
			});
			const userMembership = membersWithNames.find((member) => member.memberId === userId);

			return {
				...team,
				memberCount: membersWithNames.length,
				roomId: `team:${team.teamId}`,
				isMember: !!userMembership,
				memberType: userMembership ? userMembership.memberType : null,
				members: membersWithNames,
			};
		});
	};

	getClientTeamMembers2 = async (userId: string) => {
		const teams = await knexDb('teams as t')
			.select('t.id as teamId', 't.name as teamName')
			.where('t.ownerId', userId)
			.andWhere('t.isDeleted', false);

		const teamIds = teams.map((team) => team.teamId);

		if (teamIds.length === 0) return [];

		// Step 2: Get team members where team.ownerId = userId and memberId != ownerId
		const teamMembers = await knexDb('team_members as tm')
			.select('tm.teamId', 'tm.memberId', 'tm.memberType')
			.whereIn('tm.teamId', teamIds)
			.andWhereNot('tm.memberId', userId)
			.andWhere('tm.isDeleted', false);

		// Get unique memberIds to fetch user info in one query
		const memberIds = [...new Set(teamMembers.map((m) => m.memberId))];
		const users = memberIds.length ? await knexDb('users').whereIn('id', memberIds).select('*') : [];

		return users;
	};

	getMemberIdsForAccountManager = async (accountManagerId: string): Promise<string[]> => {
		// Step 1: Get teams the account manager is a member of
		const teams = await this.findTeamsForUser(accountManagerId);
		const teamIds = teams.map((team) => team.id);

		if (teamIds.length === 0) return [];

		// Step 2: Get all team members from those teams
		const members = await knexDb('team_members').whereIn('teamId', teamIds).select('memberId');

		// Step 3: Return unique member IDs (including or excluding the manager as needed)
		const uniqueMemberIds = [...new Set(members.map((m) => m.memberId))];

		return uniqueMemberIds;
	};

	// getUserTeamsWithMemberCount = async (userId: string) => {
	// 	return knexDb('team_members as tm')
	// 		.select(
	// 			'tm.teamId',
	// 			't.name as teamName',
	// 			knexDb.raw('COUNT(DISTINCT tm2.id) as memberCount'),
	// 			knexDb.raw(`'team:' || "tm"."teamId" as roomId`)
	// 		)
	// 		.join('teams as t', 't.id', 'tm.teamId')
	// 		.join('team_members as tm2', 'tm2.teamId', 'tm.teamId')
	// 		.where('tm.memberId', userId)
	// 		.andWhere('tm.isDeleted', false)
	// 		.andWhere('tm2.isDeleted', false)
	// 		.groupBy('tm.teamId', 't.name');
	// };
}

export const teamRepository = new TeamRepository();
