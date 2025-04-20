import { userController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import { multerUpload } from '@/common/config';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Retrieve user profile
 *     description: Allows a logged-in user to retrieve their profile information. The endpoint checks if the user is logged in, fetches the user's data from the database, and returns their profile details.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                         example: "d171a5f8-3ec0-486a-a148-0d3c2dc07289"
 *                       firstName:
 *                         type: string
 *                         example: "Dshfjfk"
 *                       lastName:
 *                         type: string
 *                         example: "Gjrjrngj"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "daviscarlos2404@gmail.com"
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       role:
 *                         type: string
 *                         example: "talent"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T17:14:26.071Z"
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in
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
 *                   example: "Please log in again"
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
 */
router.get('/', userController.getProfile);
// router.get('/all', userController.getAllUsers);
/**
 * @openapi
 * /user/update:
 *   post:
 *     summary: Update user profile
 *     description: Allows a logged-in user to update their profile information, including first name, last name, and email. The endpoint validates the user’s login status, ensures only allowed fields are updated, and applies the changes to the user’s profile in the database.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Dave"
 *                 description: The user’s first name (optional)
 *               lastName:
 *                 type: string
 *                 example: "Gjrjrngj"
 *                 description: The user’s last name (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "daviscarlos2404@gmail.com"
 *                 description: The user’s email address (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                         example: "d171a5f8-3ec0-486a-a148-0d3c2dc07289"
 *                       firstName:
 *                         type: string
 *                         example: "Dave"
 *                       lastName:
 *                         type: string
 *                         example: "Gjrjrngj"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "daviscarlos2404@gmail.com"
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       role:
 *                         type: string
 *                         example: "talent"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T17:14:26.071Z"
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad Request - User not logged in, invalid fields, or no valid fields to update
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
 *                   example: "Invalid update fields!"
 *                   enum:
 *                     - Please log in again
 *                     - Invalid update fields!
 *                     - No valid fields to update
 *       500:
 *         description: Internal Server Error - Failed to update profile
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
 *                   example: "Failed to update profile"
 */
router.post('/update', userController.updateProfile);
/**
 * @openapi
 * /user/upload-profile-picture:
 *   post:
 *     summary: Upload user profile picture
 *     description: Allows a logged-in user to upload a profile picture. The endpoint validates the user’s login status, ensures a file is provided, uploads the image to cloud storage, and updates the user’s profile with the new image URL.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the profile picture
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
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
 *                         example: "d171a5f8-3ec0-486a-a148-0d3c2dc07289"
 *                       firstName:
 *                         type: string
 *                         example: "Dave"
 *                       lastName:
 *                         type: string
 *                         example: "David"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "daviscarlos2404@gmail.com"
 *                       photo:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/profile-picture/1745083559873-GK5kZ7xXMAEltG9.png"
 *                       role:
 *                         type: string
 *                         example: "talent"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T17:14:26.071Z"
 *                 message:
 *                   type: string
 *                   example: "Profile picture updated successfully"
 *       400:
 *         description: Bad Request - User not logged in or file not provided
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
 *                   example: "Please log in again"
 *                   enum:
 *                     - Please log in again
 *                     - File is required
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - Failed to update profile picture
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
 *                   example: "Failed to update profile picture"
 */
router.post('/upload-profile-picture', multerUpload.single('photo'), userController.uploadProfilePicture);
/**
 * @openapi
 * /user/suspend-user:
 *   post:
 *     summary: Suspend or unsuspend a user
 *     description: Allows an admin to suspend or unsuspend a user by providing the user ID and suspension status. The endpoint validates the admin’s login status and role, ensures the admin is not modifying their own account, and updates the user’s suspension status in the database.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - suspend
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "d171a5f8-3ec0-486a-a148-0d3c2dc07289"
 *                 description: The ID of the user to suspend or unsuspend
 *               suspend:
 *                 type: boolean
 *                 example: true
 *                 description: Indicates whether to suspend (true) or unsuspend (false) the user
 *     responses:
 *       200:
 *         description: User suspended or unsuspended successfully
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
 *                   example: "User suspended successfully"
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
 *                   example: "Please log in again"
 *       403:
 *         description: Forbidden - Non-admin user or attempting to modify own account
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
 *                   example: "Only admins can modify user data"
 *                   enum:
 *                     - Only admins can modify user data
 *                     - You cant perform this operation on your account
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - Failed to suspend or unsuspend user
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
 *                   example: "Failed to suspend user"
 */
router.post('/suspend-user', userController.suspendUser);
/**
 * @openapi
 * /user/change-role:
 *   post:
 *     summary: Change user role
 *     description: Allows an admin user to change the role of another user. The endpoint validates the user’s login status, admin role, ensures the admin is not modifying their own account, and checks if the target user exists before updating their role in the database.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                 description: The ID of the user whose role will be changed
 *               role:
 *                 type: string
 *                 example: "accountmanager"
 *                 description: The new role to assign to the user
 *     responses:
 *       200:
 *         description: User role changed successfully
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
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       firstName:
 *                         type: string
 *                         example: "Davii"
 *                       lastName:
 *                         type: string
 *                         example: "Davii"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "uchennadavid2404@gmail.com"
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       role:
 *                         type: string
 *                         example: "accountmanager"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-15T22:34:11.478Z"
 *                       stripe_customer_id:
 *                         type: string
 *                         example: "cus_SA9NOX2NskV2PH"
 *                 message:
 *                   type: string
 *                   example: "User role changed successfully"
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
 *                   example: "Please log in again"
 *       403:
 *         description: Forbidden - Non-admin user or attempting to modify own account
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
 *                   example: "Only admins can assign admin roles"
 *                   enum:
 *                     - Only admins can assign admin roles
 *                     - You cant perform this operation on your account
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error - Failed to change user role
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
 *                   example: "Failed to change user role"
 */
router.post('/change-role', userController.makeAdmin);
router.get('/clients', userController.fetchAllClientRoleUsers);
router.get('/staffs', userController.fetchAllNonClientRoleUsers);

export { router as userRouter };
