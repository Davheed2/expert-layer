import { knexDb } from '@/common/config';
import { IUser, IWallet } from '@/common/interfaces';
import { DateTime } from 'luxon';

class UserRepository {
	create = async (payload: Partial<IUser>) => {
		return await knexDb.table('users').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IUser | null> => {
		return await knexDb.table('users').where({ id }).first();
	};

	findProfile = async (id: string) => {
		const profile = await knexDb.table('users').where({ id }).first();
		if (!profile) return [];

		const team = await knexDb.table('teams').where({ ownerId: id }).select('id').first();
		return {
			...profile,
			teamId: team ? team.id : null,
		};
	};

	findByEmail = async (email: string): Promise<IUser | null> => {
		return await knexDb.table('users').where({ email }).first();
	};

	findByUsername = async (username: string): Promise<IUser | null> => {
		return await knexDb.table('users').where({ username }).first();
	};

	findByEmailOrUsername = async (email: string, username: string): Promise<IUser | null> => {
		return await knexDb.table('users').where({ email }).orWhere({ username }).first();
	};

	findByPasswordResetToken = async (passwordResetToken: string): Promise<IUser | null> => {
		return await knexDb
			.table('users')
			.where({ passwordResetToken })
			.where('passwordResetExpires', '>', DateTime.now().toJSDate())
			.where({ isSuspended: false })
			.first();
	};

	findByVerificationToken = async (verificationToken: string): Promise<IUser | null> => {
		return await knexDb
			.table('users')
			.where({ verificationToken })
			.where('verificationTokenExpires', '>', DateTime.now().toJSDate())
			.first();
	};

	findByLoginToken = async (loginToken: string): Promise<IUser | null> => {
		return await knexDb
			.table('users')
			.where({ loginToken })
			.where('loginTokenExpires', '>', DateTime.now().toJSDate())
			.first();
	};

	update = async (id: string, payload: Partial<IUser>): Promise<IUser[]> => {
		return await knexDb('users')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	findAll = async () => {
		return await knexDb.table('users').orderBy('created_at', 'desc');
	};

	findByRole = async (role: string) => {
		return await knexDb.table('users').where({ role });
	};

	findByIsSuspended = async (isSuspended: boolean) => {
		return await knexDb.table('users').where({ isSuspended });
	};

	findByIsDeleted = async (isDeleted: boolean) => {
		return await knexDb.table('users').where({ isDeleted });
	};

	findAllAdmins = async (): Promise<IUser[]> => {
		return knexDb('users').where('role', 'admin').andWhere('isDeleted', false);
	};

	findAllNonClientRoleUsers = async (): Promise<IUser[]> => {
		return knexDb('users').whereNotIn('role', ['client']).andWhere('isDeleted', false);
	};

	findByReferralCode = async (referralCode: string): Promise<IUser | null> => {
		return await knexDb.table('users').where({ referralCode }).first();
	};

	findAllClientRoleUsers = async (): Promise<(IUser & { balance: number | null } & { accountManager: IUser[] })[]> => {
		const clients = await knexDb('users').where('role', 'client').andWhere('isDeleted', false);

		const clientIds = clients.map((client: IUser) => client.id);

		const wallets = await knexDb('wallets').whereIn('userId', clientIds).select('userId', 'balance');
		const walletMap = new Map(wallets.map((w: IWallet) => [w.userId, w.balance]));

		// Get account manager memberIds for each client from team_members
		const teamMembers = await knexDb('team_members')
			.whereIn('ownerId', clientIds)
			.andWhere('memberType', 'accountmanager')
			.select('ownerId', 'memberId');

		// Map clientId to array of account manager userIds
		const clientToManagerIds = new Map<string, string[]>();
		for (const tm of teamMembers) {
			if (!clientToManagerIds.has(tm.ownerId)) {
				clientToManagerIds.set(tm.ownerId, []);
			}
			clientToManagerIds.get(tm.ownerId)!.push(tm.memberId);
		}

		// Get all unique account manager userIds
		const allManagerIds = Array.from(new Set(teamMembers.map((tm) => tm.memberId)));
		let managers: IUser[] = [];
		if (allManagerIds.length > 0) {
			managers = (await knexDb('users')
				.whereIn('id', allManagerIds)
				.andWhere('isDeleted', false)
				.select('id', 'firstName', 'lastName', 'photo', 'email')) as IUser[];
		}
		const managerMap = new Map(managers.map((m) => [m.id, m]));

		return clients.map((client: IUser) => ({
			...client,
			balance: walletMap.get(client.id) ?? null,
			accountManager: (clientToManagerIds.get(client.id) || [])
				.map((mid) => managerMap.get(mid))
				.filter(Boolean) as IUser[],
		}));
	};

	// findAllClientRoleUsers = async (): Promise<(IUser & { balance: number | null } & { accountManager: IUser[] })[]> => {
	// 	const clients = await knexDb('users').where('role', 'client').andWhere('isDeleted', false);

	// 	const clientIds = clients.map((client: IUser) => client.id);

	// 	const wallets = await knexDb('wallets').whereIn('userId', clientIds).select('userId', 'balance');
	// 	const walletMap = new Map(wallets.map((w: IWallet) => [w.userId, w.balance]));

	// 	return clients.map((client: IUser) => ({
	// 		...client,
	// 		balance: walletMap.get(client.id) ?? null,
	// 		accountManager: [],
	// 	}));
	// };

	findAllTalentRoleUsers = async (): Promise<IUser[]> => {
		return knexDb('users').where('role', 'talent').andWhere('isDeleted', false);
	};

	findAllManagerRoleUsers = async (): Promise<IUser[]> => {
		return knexDb('users').where('role', 'accountmanager').andWhere('isDeleted', false);
	};

	findByCustomerId = async (stripe_customer_id: string): Promise<IUser[]> => {
		return knexDb('users').where({ stripe_customer_id }).andWhere('isDeleted', false);
	};
}

export const userRepository = new UserRepository();
