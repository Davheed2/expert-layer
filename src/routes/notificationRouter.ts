import { notificationController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

router.post('/create-system', notificationController.createSystemNotification);
/**
 * @openapi
 * /notification/get-systems:
 *   get:
 *     summary: Retrieve all system notifications
 *     description: Allows an admin user to retrieve a list of all system notifications. The endpoint validates the user’s login status and admin role, then fetches all system notifications from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       title:
 *                         type: string
 *                         example: "Testing!"
 *                       body:
 *                         type: string
 *                         example: "Testing was successful."
 *                       type:
 *                         type: string
 *                         example: "inApp"
 *                       source:
 *                         type: string
 *                         example: "system"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isUserConfigurable:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-17T00:13:34.852Z"
 *                 message:
 *                   type: string
 *                   example: "System notifications fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in or not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - You are not authorized to view system notifcations
 *       404:
 *         description: Not Found - No system notifications found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "No system notification found"
 */
router.get('/get-systems', notificationController.getAllSystemNotifications);
/**
 * @openapi
 * /notification/get-configurable-systems:
 *   get:
 *     summary: Retrieve all configurable system notifications
 *     description: Allows an admin user to retrieve a list of all configurable system notifications. The endpoint validates the user’s login status and admin role, then fetches all configurable system notifications from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurable system notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       title:
 *                         type: string
 *                         example: "Testing!"
 *                       body:
 *                         type: string
 *                         example: "Testing was successful."
 *                       type:
 *                         type: string
 *                         example: "inApp"
 *                       source:
 *                         type: string
 *                         example: "system"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isUserConfigurable:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-17T00:13:34.852Z"
 *                 message:
 *                   type: string
 *                   example: "Configurable system notifications fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in or not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - You are not authorized to view system notifcations
 *       404:
 *         description: Not Found - No configurable system notifications found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "No configurable system notification found"
 */
router.get('/get-configurable-systems', notificationController.getAllConfigurableSystemNotifications);
/**
 * @openapi
 * /notification/get-system:
 *   get:
 *     summary: Retrieve a system notification by ID
 *     description: Allows an admin user to retrieve a specific system notification by its ID. The endpoint validates the user’s login status, admin role, and ensures a notification ID is provided, then fetches the system notification from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sysNotificationId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *         description: The ID of the system notification to retrieve
 *     responses:
 *       200:
 *         description: System notification fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       title:
 *                         type: string
 *                         example: "Password Reset!"
 *                       body:
 *                         type: string
 *                         example: "Your password reset was successful."
 *                       type:
 *                         type: string
 *                         example: "inApp"
 *                       source:
 *                         type: string
 *                         example: "system"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isUserConfigurable:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-16T23:32:40.481Z"
 *                 message:
 *                   type: string
 *                   example: "System notification fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in, not an admin, or missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - You are not authorized to view system notifcations
 *                     - notification ID is required
 *       404:
 *         description: Not Found - System notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 */
router.get('/get-system', notificationController.getSysNotificationById);
/**
 * @openapi
 * /notification/update-system:
 *   post:
 *     summary: Update a system notification
 *     description: Allows an admin user to update a specific system notification by its ID. The endpoint validates the user’s login status, admin role, and ensures a notification ID is provided. It updates the title and/or body of the notification if provided, and returns the updated notification.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sysNotificationId
 *             properties:
 *               sysNotificationId:
 *                 type: integer
 *                 example: 3
 *                 description: The ID of the system notification to update
 *               title:
 *                 type: string
 *                 example: "Test update"
 *                 description: The updated title of the notification (optional)
 *               body:
 *                 type: string
 *                 example: "Testing was successful."
 *                 description: The updated body of the notification (optional)
 *     responses:
 *       200:
 *         description: System notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 3
 *                       title:
 *                         type: string
 *                         example: "Test update"
 *                       body:
 *                         type: string
 *                         example: "Testing was successful."
 *                       type:
 *                         type: string
 *                         example: "inApp"
 *                       source:
 *                         type: string
 *                         example: "system"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isUserConfigurable:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-17T00:13:34.852Z"
 *                 message:
 *                   type: string
 *                   example: "System notification updated"
 *       401:
 *         description: Unauthorized - User not logged in, not an admin, or missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - You are not authorized to update system notifcations
 *                     - notification ID is required
 *       404:
 *         description: Not Found - System notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 *       500:
 *         description: Internal Server Error - Failed to update system notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "failed to update system notification"
 */
router.post('/update-system', notificationController.updateSysNotification);
/**
 * @openapi
 * /notification/delete-system:
 *   post:
 *     summary: Delete a system notification
 *     description: Allows an admin user to delete a specific system notification by its ID. The endpoint validates the user’s login status, admin role, and ensures a notification ID is provided, then deletes the system notification from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sysNotificationId
 *             properties:
 *               sysNotificationId:
 *                 type: integer
 *                 example: 3
 *                 description: The ID of the system notification to delete
 *     responses:
 *       200:
 *         description: System notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "System notification deleted"
 *       401:
 *         description: Unauthorized - User not logged in, not an admin, or missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - You are not authorized to delete system notifcations
 *                     - notification ID is required
 *       404:
 *         description: Not Found - System notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 *       500:
 *         description: Internal Server Error - Failed to delete system notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "failed to delete system notification"
 */
router.post('/delete-system', notificationController.deleteSysNotification);

//User notification
/**
 * @openapi
 * /notification/user/all:
 *   get:
 *     summary: Retrieve unread user notifications
 *     description: Allows a logged-in user to retrieve a list of their unread notifications. The endpoint validates the user’s login status and fetches all unread notifications associated with the user from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread user notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "ed52a5f3-46a4-4ed7-b9d0-33389597ba7e"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       fromUserId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       sysNotificationId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       title:
 *                         type: string
 *                         example: "New user registered"
 *                       message:
 *                         type: string
 *                         example: "The user Dshfjfk Gjrjrngj just registered."
 *                       source:
 *                         type: string
 *                         example: "client"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T17:16:05.489Z"
 *                 message:
 *                   type: string
 *                   example: "User notifications fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *       404:
 *         description: Not Found - Failed to fetch unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "failed to fetch unread notifications"
 */
router.get('/user-all', notificationController.fetchAllUserNotifications);
/**
 * @openapi
 * /notification/user/unread:
 *   get:
 *     summary: Retrieve unread user notifications
 *     description: Allows a logged-in user to retrieve a list of their unread notifications. The endpoint validates the user’s login status and fetches all unread notifications associated with the user from the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread user notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "ed52a5f3-46a4-4ed7-b9d0-33389597ba7e"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       fromUserId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       sysNotificationId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       title:
 *                         type: string
 *                         example: "New user registered"
 *                       message:
 *                         type: string
 *                         example: "The user Dshfjfk Gjrjrngj just registered."
 *                       source:
 *                         type: string
 *                         example: "client"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T17:16:05.489Z"
 *                 message:
 *                   type: string
 *                   example: "User notifications fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *       404:
 *         description: Not Found - Failed to fetch unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "failed to fetch unread notifications"
 */
router.get('/user-unread', notificationController.fetchUnreadUserNotifications);
/**
 * @openapi
 * /notification/mark-read:
 *   post:
 *     summary: Mark a notification as read
 *     description: Allows a logged-in user to mark a specific notification as read by providing its ID. The endpoint validates the user’s login status, ensures the notification ID is provided, checks if the notification exists and is unread, and updates its status to read in the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationId
 *             properties:
 *               notificationId:
 *                 type: string
 *                 format: uuid
 *                 example: "18ff3281-1c97-42ad-b3fa-de8cbaee826c"
 *                 description: The ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "18ff3281-1c97-42ad-b3fa-de8cbaee826c"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       fromUserId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       sysNotificationId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       title:
 *                         type: string
 *                         example: "New user registered"
 *                       message:
 *                         type: string
 *                         example: "The user David David just registered."
 *                       source:
 *                         type: string
 *                         example: "client"
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       readAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T23:08:14.844Z"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-16T23:37:09.154Z"
 *                 message:
 *                   type: string
 *                   example: "Notification read successfully"
 *       400:
 *         description: Bad Request - Notification already read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification already read"
 *       401:
 *         description: Unauthorized - User not logged in or missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - Notification ID is required
 *       404:
 *         description: Not Found - Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 *       500:
 *         description: Internal Server Error - Failed to mark notification as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "failed to mark as read"
 */
router.post('/mark-read', notificationController.markAsRead);
/**
 * @openapi
 * /notification/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Allows a logged-in user to mark all their unread notifications as read. The endpoint validates the user’s login status, checks for unread notifications, and updates their status to read in the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "All notifications read successfully"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *       400:
 *         description: Bad Request - All notifications already read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "All notification have been read"
 *       404:
 *         description: Not Found - No unread notifications found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "No unread notifications found"
 */
router.post('/mark-all-read', notificationController.markAllAsRead);
/**
 * @openapi
 * /notification/user-delete:
 *   post:
 *     summary: Delete a notification
 *     description: Allows a logged-in user to soft delete a specific notification by its ID. The endpoint validates the user’s login status, ensures the notification ID is provided, checks if the notification exists and has not already been deleted, and performs a soft delete in the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationId
 *             properties:
 *               notificationId:
 *                 type: string
 *                 format: uuid
 *                 example: "18ff3281-1c97-42ad-b3fa-de8cbaee826c"
 *                 description: The ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Notification deleted successfully"
 *       400:
 *         description: Bad Request - Notification already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification has already been deleted"
 *       401:
 *         description: Unauthorized - User not logged in or missing notification ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *                   enum:
 *                     - You are not logged in
 *                     - Notification ID is required
 *       404:
 *         description: Not Found - Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification not found"
 *       500:
 *         description: Internal Server Error - Failed to delete notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to delete notification"
 */
router.post('/user-delete', notificationController.deleteNotification);

//User settings
/**
 * @openapi
 * /notification/user-settings:
 *   post:
 *     summary: Create or update user notification setting
 *     description: Allows a logged-in user to create or update their notification settings for a specific system notification. The endpoint validates the user’s login status, ensures the notification ID and enabled status are provided, checks if the notification exists and is user-configurable, and updates the user’s notification settings in the database.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sysNotificationId
 *               - enabled
 *             properties:
 *               sysNotificationId:
 *                 type: integer
 *                 example: 3
 *                 description: The ID of the system notification to configure
 *               enabled:
 *                 type: boolean
 *                 example: true
 *                 description: Indicates whether the notification is enabled for the user
 *     responses:
 *       200:
 *         description: Notification setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Notification setting updated successfully"
 *       400:
 *         description: Bad Request - Missing required fields or non-configurable notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Notification ID and enabled is required"
 *                   enum:
 *                     - Notification ID and enabled is required
 *                     - This notification setting can not be modified
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "You are not logged in"
 *       404:
 *         description: Not Found - System notification not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "System Notification not found"
 *       500:
 *         description: Internal Server Error - Failed to modify notification settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to modify notification settings"
 */
router.post('/user-settings', notificationController.createUserSetting);

export { router as notificationRouter };
