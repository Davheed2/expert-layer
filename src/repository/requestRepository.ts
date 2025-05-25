import { knexDb } from '@/common/config';
import { IRequests, IRequestFiles, IRequestTalents } from '@/common/interfaces';
import { DateTime } from 'luxon';

class RequestsRepository {
	create = async (payload: Partial<IRequests>) => {
		return await knexDb.table('requests').insert(payload).returning('*');
	};

	createRequestFile = async (payload: Partial<IRequestFiles>) => {
		return await knexDb.table('request_files').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IRequests | null> => {
		return await knexDb.table('requests').where({ id }).first();
	};

	findAll = async (): Promise<IRequests[]> => {
		return await knexDb.table('requests').where({ isDeleted: false }).orderBy('created_at', 'desc');
	};

	findAll2 = async (): Promise<(IRequests & { files: IRequestFiles[] } & { experts: IRequestTalents[] })[]> => {
		const requests = await knexDb.table('requests').where({ isDeleted: false }).orderBy('created_at', 'desc');

		const requestsWithFiles = await Promise.all(
			requests.map(async (request) => {
				const files = await knexDb.table('request_files').where({ requestId: request.id, isDeleted: false });
				const expert = await knexDb
					.table('request_talents')
					.where({ requestId: request.id, isDeleted: false })
					.select('userId');

				let experts = [];
				if (expert.length > 0) {
					experts = await knexDb
						.table('users')
						.whereIn(
							'id',
							expert.map((e: { userId: string }) => e.userId)
						)
						.select('id', 'firstName', 'lastName', 'photo');
				}
				return { ...request, files, experts };
			})
		);

		return requestsWithFiles;
	};

	findByRequestFileId = async (id: string): Promise<IRequestFiles | null> => {
		return await knexDb.table('request_files').where({ id }).first();
	};

	update = async (id: string, payload: Partial<IRequests>) => {
		return await knexDb('requests')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	softDelete = async (id: string) => {
		return await knexDb('requests').where({ id }).update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};

	findByUserId = async (
		userId: string
	): Promise<(IRequests & { files: IRequestFiles[] } & { experts: IRequestTalents[] })[]> => {
		const requests = await knexDb.table('requests').where({ userId, isDeleted: false }).orderBy('created_at', 'desc');

		const requestsWithFiles = await Promise.all(
			requests.map(async (request) => {
				const files = await knexDb.table('request_files').where({ requestId: request.id, isDeleted: false });
				const expert = await knexDb
					.table('request_talents')
					.where({ requestId: request.id, isDeleted: false })
					.select('userId');

				let experts = [];
				if (expert.length > 0) {
					experts = await knexDb
						.table('users')
						.whereIn(
							'id',
							expert.map((e: { userId: string }) => e.userId)
						)
						.select('id', 'firstName', 'lastName', 'photo');
				}
				return { ...request, files, experts };
			})
		);

		return requestsWithFiles;
	};

	findByTalentId = async (
		userId: string
	): Promise<(IRequests & { files: IRequestFiles[] } & { experts: IRequestTalents[] })[]> => {
		const requestTalents = await knexDb('request_talents').where({ userId, isDeleted: false }).select('requestId');

		const requestIds = requestTalents.map((rt: { requestId: string }) => rt.requestId);

		if (requestIds.length === 0) return [];

		const requests = await knexDb('requests')
			.whereIn('id', requestIds)
			.andWhere({ isDeleted: false })
			.orderBy('created_at', 'desc');

		const requestsWithFiles = await Promise.all(
			requests.map(async (request) => {
				const files = await knexDb('request_files').where({ requestId: request.id, isDeleted: false });
				const expert = await knexDb('request_talents')
					.where({ requestId: request.id, isDeleted: false })
					.select('userId');

				let experts = [];
				if (expert.length > 0) {
					experts = await knexDb('users')
						.whereIn(
							'id',
							expert.map((e: { userId: string }) => e.userId)
						)
						.select('id', 'firstName', 'lastName', 'photo');
				}
				return { ...request, files, experts };
			})
		);

		return requestsWithFiles;
	};

	findByManagerId = async (
		managerId: string
	): Promise<(IRequests & { files: IRequestFiles[] } & { experts: IRequestTalents[] })[]> => {
		// Get all teams where the manager is a member (not owner)
		const teams = await knexDb('teams as t')
			.select('t.id as teamId')
			.join('team_members as tm', 'tm.teamId', 't.id')
			.where('tm.memberId', managerId)
			.andWhere('t.ownerId', '!=', managerId)
			.andWhere('t.isDeleted', false);

		const teamIds = teams.map((t: { teamId: string }) => t.teamId);
		if (teamIds.length === 0) return [];

		// Get all team members (users under the manager)
		const teamMembers = await knexDb('team_members')
			.whereIn('teamId', teamIds)
			.andWhere('isDeleted', false)
			.select('ownerId', 'memberId');

		const userIds = [...new Set(teamMembers.map((m: { ownerId: string }) => m.ownerId))];
		if (userIds.length === 0) return [];

		// Get all requests made by these users
		const requests = await knexDb('requests')
			.whereIn('userId', userIds)
			.andWhere({ isDeleted: false })
			.orderBy('created_at', 'desc');

		const requestsWithFiles = await Promise.all(
			requests.map(async (request) => {
				const files = await knexDb('request_files').where({ requestId: request.id, isDeleted: false });
				const expert = await knexDb('request_talents')
					.where({ requestId: request.id, isDeleted: false })
					.select('userId');

				let experts = [];
				if (expert.length > 0) {
					experts = await knexDb('users')
						.whereIn(
							'id',
							expert.map((e: { userId: string }) => e.userId)
						)
						.select('id', 'firstName', 'lastName', 'photo');
				}
				return { ...request, files, experts };
			})
		);

		return requestsWithFiles;
	};

	findRequestById = async (
		id: string
	): Promise<(IRequests & { files: IRequestFiles[] } & { experts: IRequestTalents[] })[]> => {
		const requests: IRequests[] = await knexDb.table('requests').where({ id, isDeleted: false });

		const requestsWithFiles = await Promise.all(
			requests.map(async (request) => {
				const files = await knexDb.table('request_files').where({ requestId: request.id, isDeleted: false });
				const expert = await knexDb
					.table('request_talents')
					.where({ requestId: request.id, isDeleted: false })
					.select('userId');

				let experts = [];
				if (expert.length > 0) {
					experts = await knexDb
						.table('users')
						.whereIn(
							'id',
							expert.map((e: { userId: string }) => e.userId)
						)
						.select('id', 'firstName', 'lastName', 'photo');
				}

				return { ...request, files, experts };
			})
		);

		return requestsWithFiles;
	};

	findByUserIdAndServiceId = async (userId: string, serviceId: string): Promise<IRequests[]> => {
		return await knexDb.table('requests').where({ userId, serviceId, isDeleted: false }).orderBy('created_at', 'desc');
	};

	deleteRequestFile = async (id: string) => {
		return await knexDb('request_files')
			.where({ id })
			.update({ isDeleted: true, updated_at: DateTime.now().toJSDate() });
	};

	addExpertToRequest = async (payload: Partial<IRequestTalents>) => {
		return await knexDb.table('request_talents').insert(payload).returning('*');
	};

	removeExpertFromRequest = async (id: string) => {
		return await knexDb.table('request_talents').where({ id }).del().returning('*');
	};

	findRequestTalentById = async (requestId: string, userId: string) => {
		return await knexDb('request_talents').where({ requestId, userId }).first();
	};

	getTalentsForRequest = async (requestId: string): Promise<IRequestTalents[]> => {
		return await knexDb('request_talents').where({ requestId, isDeleted: false });
	};

	findRequestTalentByRequestId = async (requestId: string) => {
		return await knexDb('request_talents').where({ requestId }).first();
	};
}

export const requestsRepository = new RequestsRepository();
