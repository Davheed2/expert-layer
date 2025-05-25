import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	getDomainReferer,
	sendAssignedManagerEmail,
	sendInviteExistingUserEmail,
	sendInviteNonExistingUserEmail,
	sendJoinTeamEmail,
	toJSON,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { teamRepository, userRepository } from '@/repository';
import { Team } from '@/services/Team';
import { ITeam } from '@/common/interfaces';

export class TeamController {
	getAllTeams = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const teams = await teamRepository.getAllTeams();
		return AppResponse(res, 200, toJSON(teams), 'Teams retrieved successfully', req);
	});

	findTeamById = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { teamId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const team = await teamRepository.getTeam(teamId as string);
		if (!team) throw new AppError('No team Found', 404);

		return AppResponse(res, 200, toJSON([team]), 'Team retrieved successfully', req);
	});

	clientInviteTeamMember = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { email } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!email) {
			throw new AppError('Users email is required', 400);
		}

		const teamOwner = await userRepository.findByEmail(user.email);
		if (!teamOwner) {
			throw new AppError('User not found', 404);
		}

		const team = await teamRepository.getTeamByOwnerId(teamOwner.id);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		if (user.role !== 'client' && team.ownerId !== user.id) {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const addedUser = await userRepository.findByEmail(email);
		if (!addedUser) {
			const referralLink = `${getDomainReferer(req)}/auth/register?ref=${teamOwner.referralCode}`;

			await sendInviteNonExistingUserEmail(email, '', teamOwner.firstName, teamOwner.lastName, referralLink);
			return AppResponse(res, 201, null, 'Invitation sent to user to join the team', req);
		}

		const teamMember = await teamRepository.getTeamMember(team.id, addedUser.id);
		if (teamMember) {
			throw new AppError('User is already a member of the team', 400);
		}

		const referralLink = `${getDomainReferer(req)}/dashboard/?ref=${teamOwner.referralCode}`;
		await sendInviteExistingUserEmail(
			addedUser.email,
			addedUser.firstName,
			`${teamOwner.firstName} ${teamOwner.lastName}`,
			referralLink
		);

		return AppResponse(res, 201, null, 'Team member added successfully', req);
	});

	acceptTeamInvite = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { referralCode } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!referralCode) {
			throw new AppError('Referral code is required', 400);
		}

		const teamOwner = await userRepository.findByReferralCode(referralCode);
		if (!teamOwner) {
			throw new AppError('Team owner not found', 404);
		}

		const team = await teamRepository.getTeamByOwnerId(teamOwner.id);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		const teamMember = await teamRepository.getTeamMember(team.id, user.id);
		if (teamMember) {
			throw new AppError('You are already a member of the team', 400);
		}

		const newTeamMember = await Team.addMember({
			teamId: team.id,
			ownerId: team.ownerId,
			memberId: user.id,
			memberType: user.role,
		});
		if (!newTeamMember) {
			throw new AppError('Failed to accept team invite', 500);
		}

		await sendJoinTeamEmail(user.email, user.firstName, `${teamOwner.firstName} ${teamOwner.lastName}`);

		return AppResponse(res, 201, toJSON([newTeamMember]), 'Team invite accepted successfully', req);
	});

	addTeamMember = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { email, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!email) {
			throw new AppError('Users email is required', 400);
		}
		if (!userId) {
			throw new AppError('User ID is required', 400);
		}

		const teamOwner = await userRepository.findById(userId);
		if (!teamOwner) {
			throw new AppError('User not found', 404);
		}

		const team = await teamRepository.getTeamByOwnerId(teamOwner.id);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		if (user.role !== 'admin') {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const addedUser = await userRepository.findByEmail(email);
		if (!addedUser) {
			throw new AppError('Account Manager not found', 404);
		}

		const teamMember = await teamRepository.getTeamMember(team.id, addedUser.id);
		if (teamMember) {
			throw new AppError('User is already a member of the team', 400);
		}

		const newTeamMember = await Team.addMember({
			teamId: team.id,
			ownerId: team.ownerId,
			memberId: addedUser.id,
			memberType: addedUser.role,
		});
		if (!newTeamMember) {
			throw new AppError('Failed to add team member', 500);
		}

		await sendJoinTeamEmail(addedUser.email, addedUser.firstName, `${user.firstName} ${user.lastName}'s`);
		if (addedUser.role === 'accountmanager') {
			await sendAssignedManagerEmail(addedUser.email, addedUser.firstName);
		}

		return AppResponse(res, 201, toJSON([newTeamMember]), 'Team member added successfully', req);
	});

	fetchTeamsWithMembers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const teams = await teamRepository.getAllTeamsWithMembers();
		if (!teams) throw new AppError('No teams Found', 404);
		return AppResponse(res, 200, toJSON(teams), 'Teams with members retrieved successfully', req);
	});

	getUserTeamsHandler = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		let teams: ITeam[];
		if (user.role === 'client') {
			teams = await teamRepository.getClientTeamMembers(user.id);
			if (!teams) throw new AppError('No teams Found', 404);
		} else if (user.role === 'accountmanager') {
			teams = await teamRepository.getManagerTeamsWithMemberCount(user.id);
			if (!teams) throw new AppError('No teams Found', 404);
		} else {
			teams = await teamRepository.getUserTeamsWithMemberCount(user.id);
			if (!teams) throw new AppError('No teams Found', 404);
		}

		return AppResponse(res, 200, toJSON(teams), 'User teams retrieved successfully', req);
	});

	getClientTeamMembers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const teams = await teamRepository.getClientTeamMembers2(user.id);
		if (!teams) throw new AppError('No teams Found', 404);

		return AppResponse(res, 200, toJSON(teams), 'User team members retrieved successfully', req);
	});

	getUserTeamHandler = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { teamId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!teamId) {
			throw new AppError('Team ID is required', 400);
		}

		const teams = await teamRepository.getUserTeamWithMemberCount(teamId as string, user.id);
		if (!teams) throw new AppError('Failed to fetch user team', 404);
		return AppResponse(res, 200, toJSON(teams), 'User team retrieved successfully', req);
	});
}

export const teamController = new TeamController();
