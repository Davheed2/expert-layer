import { Request, Response } from 'express';
import { AppError, AppResponse, sendAssignedManagerEmail, sendJoinTeamEmail, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { teamRepository, userRepository } from '@/repository';
import { Team } from '@/services/Team';

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

	addTeamMember = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { ownerEmail, email } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!ownerEmail || !email) {
			throw new AppError('Users email and account managers email are required', 400);
		}

		const teamOwner = await userRepository.findByEmail(ownerEmail);
		if (!teamOwner) {
			throw new AppError('User not found', 404);
		}

		const team = await teamRepository.getTeamByOwnerId(teamOwner.id);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		if (user.role !== 'admin' && team.ownerId !== user.id) {
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
		await sendAssignedManagerEmail(teamOwner.email, teamOwner.firstName);

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

		const teams = await teamRepository.getUserTeamsWithMemberCount(user.id);
		if (!teams) throw new AppError('Failed to fetch user teams', 404);
		return AppResponse(res, 200, toJSON(teams), 'User teams retrieved successfully', req);
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
