import { Request, Response } from 'express';
import { AppError, AppResponse, clearCookie, setCookie, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { userRepository } from '@/repository';
import { IUser } from '@/common/interfaces';

export class UserController {
	getProfile = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const extinguishUser = await userRepository.findProfile(user.id);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		return AppResponse(res, 200, toJSON([extinguishUser]), 'Profile retrieved successfully', req);
	});

	getUserProfile = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { userId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not allowed to access this resource', 400);
		}

		const extinguishUser = await userRepository.findProfile(userId as string);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		return AppResponse(res, 200, toJSON([extinguishUser]), 'User profile retrieved successfully', req);
	});

	findByReferralCode = catchAsync(async (req: Request, res: Response) => {
		const { referralCode } = req.query;

		if (!referralCode) {
			throw new AppError('Referral code is required', 400);
		}

		const user = await userRepository.findByReferralCode(referralCode as string);
		if (!user) {
			throw new AppError('No user found with this referral code', 404);
		}

		return AppResponse(res, 200, toJSON(user), 'User found successfully', req);
	});

	updateProfile = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const allowedUpdates = ['firstName', 'lastName', 'email'];
		const updates = Object.keys(req.body);

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
		if (!isValidOperation) {
			throw new AppError('Invalid update fields!', 400);
		}

		const updateData: Partial<IUser> = {};
		updates.forEach((update) => {
			if (req.body[update]) {
				updateData[update] = req.body[update];
			}
		});

		if (Object.keys(updateData).length === 0) {
			throw new AppError('No valid fields to update', 400);
		}

		if (updateData.email) {
			const existingUser = await userRepository.findByEmail(updateData.email);
			if (existingUser && existingUser.id !== user.id) {
				throw new AppError('Email already in use by another user', 400);
			}
		}

		const updateProfile = await userRepository.update(user.id, updateData);
		if (!updateProfile) {
			throw new AppError('Failed to update profile', 500);
		}

		return AppResponse(res, 200, toJSON(updateProfile), 'Profile updated successfully', req);
	});

	uploadProfilePicture = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { file } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!file) {
			throw new AppError('File is required', 400);
		}

		const extinguishUser = await userRepository.findById(user.id as string);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		const { secureUrl } = await uploadPictureFile({
			fileName: `profile-picture/${Date.now()}-${file.originalname}`,
			buffer: file.buffer,
			mimetype: file.mimetype,
		});

		const updateProfile = await userRepository.update(user.id, {
			photo: secureUrl,
		});
		if (!updateProfile) {
			throw new AppError('Failed to update profile picture', 500);
		}

		return AppResponse(res, 200, toJSON(updateProfile), 'Profile picture updated successfully', req);
	});

	suspendUser = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { suspend, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can modify user data', 403);
		}
		if (user.id === userId) {
			throw new AppError('You cant perform this operation on your account', 403);
		}

		const extinguishUser = await userRepository.findById(userId);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		const suspendUser = await userRepository.update(userId, {
			isSuspended: suspend ? true : false,
		});
		if (!suspendUser) {
			throw new AppError(`Failed to ${suspend ? 'suspend' : 'un suspend'} user`, 500);
		}

		return AppResponse(res, 200, null, `User ${suspend ? 'suspended' : 'unsuspended'} successfully`, req);
	});

	makeAdmin = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { role, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can assign admin roles', 403);
		}
		if (user.id === userId) {
			throw new AppError('You cant perform this operation on your account', 403);
		}

		const extinguishUser = await userRepository.findById(userId);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		const changeRole = await userRepository.update(userId, {
			role,
		});
		if (!changeRole) {
			throw new AppError(`Failed to change user role`, 500);
		}

		return AppResponse(res, 200, toJSON(changeRole), `User role changed successfully`, req);
	});

	fetchAllClientRoleUsers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can view all users', 403);
		}

		const users = await userRepository.findAllClientRoleUsers();
		if (!users) {
			throw new AppError('Failed to fetch users', 500);
		}

		return AppResponse(res, 200, toJSON(users), 'Users fetched successfully', req);
	});

	fetchAllNonClientRoleUsers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can view all users', 403);
		}

		const users = await userRepository.findAllNonClientRoleUsers();
		if (!users) {
			throw new AppError('Failed to fetch users', 500);
		}

		return AppResponse(res, 200, toJSON(users), 'Users fetched successfully', req);
	});

	fetchAllTalentRoleUsers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}

		const users = await userRepository.findAllTalentRoleUsers();
		if (!users) {
			throw new AppError('Failed to fetch users', 500);
		}

		return AppResponse(res, 200, toJSON(users), 'Users fetched successfully', req);
	});

	startImpersonation = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Not authorized to impersonate', 403);
		}

		const userToImpersonate = await userRepository.findById(userId);
		if (!userToImpersonate) {
			throw new AppError('User to impersonate not found', 404);
		}

		// Set impersonate cookie
		setCookie(req, res, 'impersonateUserId', userId, 1000 * 60 * 60 * 24); // 24 hours

		return AppResponse(res, 200, null, `Now impersonating ${userToImpersonate.firstName}`, req);
	});

	stopImpersonation = catchAsync(async (req: Request, res: Response) => {
		clearCookie(req, res, 'impersonateUserId');

		return AppResponse(res, 200, null, 'Impersonation stopped successfully', req);
	});
}

export const userController = new UserController();
