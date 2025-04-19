import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { notificationRepository, sysNotificationRepository, notificationSettingsRepository } from '@/repository';

export class NotificationController {
	createSystemNotification = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { title, body, isUserConfigurable } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to create system notifcations', 401);
		}
		if (!title || !body) {
			throw new AppError('Title and body are required', 400);
		}

		const findTitle = await sysNotificationRepository.findByTitle(title);
		if (findTitle) {
			throw new AppError('System notification title exists already', 400);
		}

		const findBody = await sysNotificationRepository.findByTitle(title);
		if (findBody) {
			throw new AppError('System notification body exists already', 400);
		}

		const notification = await sysNotificationRepository.create({ title, body, isUserConfigurable });
		if (!notification) {
			throw new AppError('failed to create system notification', 500);
		}

		return AppResponse(res, 200, toJSON(notification), 'System notification created successfully');
	});

	getAllSystemNotifications = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to view system notifcations', 401);
		}

		const notification = await sysNotificationRepository.findAll();
		if (!notification) {
			throw new AppError('No system notification found', 404);
		}

		return AppResponse(res, 200, toJSON(notification), 'System notifications fetched successfully');
	});

	getAllConfigurableSystemNotifications = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		//check if other users can view this
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to view system notifcations', 401);
		}

		const notification = await sysNotificationRepository.findAllConfigurable();
		if (!notification) {
			throw new AppError('No configurable system notification found', 404);
		}

		return AppResponse(res, 200, toJSON(notification), 'Configurable system notifications fetched successfully');
	});

	getSysNotificationById = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { sysNotificationId } = req.query;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to view system notifcations', 401);
		}
		if (!sysNotificationId) {
			throw new AppError('notification ID is required', 401);
		}

		const notification = await sysNotificationRepository.findById(Number(sysNotificationId));
		if (!notification) {
			throw new AppError('Notification not found', 404);
		}

		return AppResponse(res, 200, toJSON([notification]), 'System notification fetched successfully');
	});

	updateSysNotification = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { title, body, sysNotificationId } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to update system notifcations', 401);
		}
		if (!sysNotificationId) {
			throw new AppError('notification ID is required', 401);
		}

		const existing = await sysNotificationRepository.findById(sysNotificationId);
		if (!existing) {
			throw new AppError('Notification not found', 404);
		}

		const updated = await sysNotificationRepository.update(sysNotificationId, {
			...(title ? { title } : {}),
			...(body ? { body } : {}),
		});
		if (!updated) {
			throw new AppError('failed to update system notification', 500);
		}

		return AppResponse(res, 200, toJSON(updated), 'System notification updated');
	});

	deleteSysNotification = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { sysNotificationId } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to delete system notifcations', 401);
		}
		if (!sysNotificationId) {
			throw new AppError('notification ID is required', 401);
		}

		const existing = await sysNotificationRepository.findById(sysNotificationId);
		if (!existing) {
			throw new AppError('Notification not found', 404);
		}

		const deleteSys = await sysNotificationRepository.delete(sysNotificationId);
		if (!deleteSys) {
			throw new AppError('failed to delete system notification', 500);
		}

		return AppResponse(res, 200, null, 'System notification deleted');
	});

	fetchUnreadUserNotifications = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		const notification = await notificationRepository.findUnreadForUser(user.id);
		if (!notification) {
			throw new AppError('failed to fetch unread notifications', 404);
		}

		return AppResponse(res, 200, toJSON(notification), 'Unread user notifications fetched successfully');
	});

	fetchAllUserNotifications = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		const notification = await notificationRepository.findForUser(user.id);
		if (!notification) {
			throw new AppError('failed to fetch unread notifications', 404);
		}

		return AppResponse(res, 200, toJSON(notification), 'User notifications fetched successfully');
	});

	markAsRead = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { notificationId } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (!notificationId) {
			throw new AppError('Notification ID is required', 401);
		}

		const unreadNotification = await notificationRepository.findById(notificationId);
		if (!unreadNotification) {
			throw new AppError('Notification not found', 404);
		}
		if (unreadNotification.isRead) {
			throw new AppError('Notification already read', 400);
		}

		const notification = await notificationRepository.markAsRead(notificationId);
		if (!notification) {
			throw new AppError('failed to mark as read', 500);
		}

		return AppResponse(res, 200, toJSON(notification), 'Notification read successfully');
	});

	markAllAsRead = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		const unread = await notificationRepository.findUnreadForUser(user.id);
		if (!unread) {
			throw new AppError('No unread notifications found', 404);
		}

		const notification = await notificationRepository.markAllAsReadForUser(user.id);
		if (notification === 0) {
			throw new AppError('All notification have been read', 400);
		}

		return AppResponse(res, 200, null, 'All notifications read successfully');
	});

	deleteNotification = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { notificationId } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (!notificationId) {
			throw new AppError('Notification ID is required', 401);
		}

		const notification = await notificationRepository.findById(notificationId);
		if (!notification) {
			throw new AppError('Notification not found', 404);
		}
		if (notification.isDeleted) {
			throw new AppError('Notification has already been deleted', 400);
		}

		const deleteNotification = await notificationRepository.softDelete(notificationId);
		if (!deleteNotification) {
			throw new AppError('Failed to delete notification', 500);
		}

		return AppResponse(res, 200, null, 'Notification deleted successfully');
	});

	createUserSetting = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { sysNotificationId, enabled } = req.body;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}
		if (!sysNotificationId || typeof enabled !== 'boolean') {
			throw new AppError('Notification ID and enabled is required', 400);
		}

		const notification = await sysNotificationRepository.findById(sysNotificationId);
		if (!notification) {
			throw new AppError('System Notification not found', 404);
		}
		if (!notification.isUserConfigurable) {
			throw new AppError('This notification setting can not be modified', 400);
		}

		const setting = await notificationSettingsRepository.upsertUserNotificationSetting(
			user.id,
			sysNotificationId,
			enabled
		);
		if (!setting) {
			throw new AppError('Failed to modify notification settings', 500);
		}

		return AppResponse(res, 200, null, 'Notification setting updated successfully');
	});
}

export const notificationController = new NotificationController();

//usage
// const users = await userRepository.findAllAdmins();
// 		await Notification.notifyUsersWithSettings({
// 			users,
// 			sysNotificationId: 3,
// 		});

// const scenarios = [
// 	{
// 		id: 1,
// 		title: 'Request Updated',
// 		body: 'A client has updated their request (e.g. priority or completion).',
// 		type: 'INAPP',
// 		source: 'client',
// 		isActive: true,
// 		isUserConfigurable: true,
// 	},
// 	{
// 		id: 2,
// 		title: 'New Comment (Team)',
// 		body: 'A team member has commented on your assigned request.',
// 		type: 'INAPP',
// 		source: 'team',
// 		isActive: true,
// 		isUserConfigurable: true,
// 	},
// 	{
// 		id: 3,
// 		title: 'New Comment (Client)',
// 		body: 'A client has commented on your assigned request.',
// 		type: 'INAPP',
// 		source: 'client',
// 		isActive: true,
// 		isUserConfigurable: true,
// 	},
// 	{
// 		id: 4,
// 		title: 'New Assigned Request',
// 		body: 'A new service request has been assigned to you.',
// 		type: 'INAPP',
// 		source: 'team',
// 		isActive: true,
// 		isUserConfigurable: true,
// 	},
// ];
