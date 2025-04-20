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
		return AppResponse(res, 200, toJSON(teams), 'Teams retrieved successfully');
	});

	addTeamMember = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { teamId, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
        if (!teamId || !userId) {
            throw new AppError('Team ID and User ID are required', 400);
        }

		const team = await teamRepository.getTeam(teamId);
		if (!team) {
			throw new AppError('Team not found', 404);
		}

		if (user.role !== 'admin' || team.ownerId !== user.id) {
			throw new AppError('You do not have permission to access this resource', 403);
		}

		const addedUser = await userRepository.findById(userId);
		if (!addedUser) {
			throw new AppError('User not found', 404);
		}

		const teamMember = await teamRepository.getTeamMember(teamId, userId);
		if (teamMember) {
			throw new AppError('User is already a member of the team', 400);
		}

		const newTeamMember = await Team.addMember({
			teamId,
            ownerId: team.ownerId,
			memberId: userId,
			memberType: addedUser.role,
		});
		if (!newTeamMember) {
			throw new AppError('Failed to add team member', 500);
		}

		return AppResponse(res, 201, toJSON([newTeamMember]), 'Team member added successfully');
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
		return AppResponse(res, 200, toJSON(teams), 'Teams with members retrieved successfully');
	});
}

export const teamController = new TeamController();
