import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
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

	addTeamMember = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { teamId, email } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!teamId || !email) {
			throw new AppError('Team ID and email are required', 400);
		}

		const team = await teamRepository.getTeam(teamId);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		console.log('team', team)

		if (user.role !== 'admin' || team.ownerId !== user.id) {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const addedUser = await userRepository.findByEmail(email);
		if (!addedUser) {
			throw new AppError('User not found', 404);
		}

		const teamMember = await teamRepository.getTeamMember(teamId, addedUser.id);
		if (teamMember) {
			throw new AppError('User is already a member of the team', 400);
		}

		const newTeamMember = await Team.addMember({
			teamId,
			ownerId: team.ownerId,
			memberId: addedUser.id,
			memberType: addedUser.role,
		});
		if (!newTeamMember) {
			throw new AppError('Failed to add team member', 500);
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
		return AppResponse(res, 200, toJSON(teams), 'Teams with members retrieved successfully', req);
	});
}

export const teamController = new TeamController();
