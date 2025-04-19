import { notificationController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

router.post('/create-system', notificationController.createSystemNotification);
router.get('/get-systems', notificationController.getAllSystemNotifications);
router.get('/get-configurable-systems', notificationController.getAllConfigurableSystemNotifications);
router.get('/get-system', notificationController.getSysNotificationById);
router.post('/update-system', notificationController.updateSysNotification);
router.post('/delete-system', notificationController.deleteSysNotification);

//User notification
router.get('/user-all', notificationController.fetchAllUserNotifications);
router.get('/user-unread', notificationController.fetchUnreadUserNotifications);
router.post('/mark-read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/user-delete', notificationController.deleteNotification);

//User settings
router.post('/user-settings', notificationController.createUserSetting);

export { router as notificationRouter };
