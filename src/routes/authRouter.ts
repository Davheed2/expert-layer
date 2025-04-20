import { authController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     summary: User sign up
 *     description: Allows a new user to sign up by providing their email, password, first name, last name, and role. The endpoint validates the input data, checks for existing users with the same email, hashes the password, generates a verification token, and creates a new user in the database. A verification link is prepared to be sent to the user's email for account verification.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "uchennadavid@gmail.com"
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: The user's password
 *               firstName:
 *                 type: string
 *                 example: "Dshfjfk"
 *                 description: The user's first name
 *               lastName:
 *                 type: string
 *                 example: "Gjrjrngj"
 *                 description: The user's last name
 *               role:
 *                 type: string
 *                 example: "talent"
 *                 description: The user's role
 *     responses:
 *       201:
 *         description: User created successfully, verification link sent
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
 *                         example: "5bfc14e3-df7a-48fc-8c32-9624ea18291b"
 *                       firstName:
 *                         type: string
 *                         example: "Dshfjfk"
 *                       lastName:
 *                         type: string
 *                         example: "Gjrjrngj"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "uchennadavid@gmail.com"
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
 *                         example: "2025-04-19T12:59:55.868Z"
 *                 message:
 *                   type: string
 *                   example: "Verification link sent to uchennadavid@gmail.com"
 *       400:
 *         description: Bad Request - Incomplete signup data
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
 *                   example: "Incomplete signup data"
 *       409:
 *         description: Conflict - User with this email already exists
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
 *                   example: "User with this email already exists"
 *       500:
 *         description: Internal Server Error - Failed to create user
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
 *                   example: "Failed to create user"
 */
router.post('/sign-up', authController.signUp);
/**
 * @openapi
 * /auth/verify-account:
 *   get:
 *     summary: Verify user account
 *     description: Verifies a user's account using a verification token provided in the query string. The endpoint validates the token, checks if the account is already verified, ensures the token is unused and not expired, updates the user's verification status, and sends notifications to admins about the new user registration.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: verificationToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: The verification token sent to the user's email
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                         example: "5bfc14e3-df7a-48fc-8c32-9624ea18291b"
 *                       firstName:
 *                         type: string
 *                         example: "Dshfjfk"
 *                       lastName:
 *                         type: string
 *                         example: "Gjrjrngj"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "uchennadavid@gmail.com"
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
 *                         example: "2025-04-19T12:59:55.868Z"
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       400:
 *         description: Bad Request - Invalid or missing token, already verified, used, or expired
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
 *                   example: "Verification token is required"
 *                   enum:
 *                     - Verification token is required
 *                     - Account Already Verified
 *                     - Verification token has already been used
 *                     - Verification token has expired
 *       401:
 *         description: Unauthorized - Invalid verification token
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
 *                   example: "Invalid verification token"
 *       404:
 *         description: Not Found - Invalid or expired verification token
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
 *                   example: "Invalid or expired verification token"
 */
router.get('/verify-account', authController.verifyAccount);
/**
 * @openapi
 * /auth/sign-in:
 *   post:
 *     summary: User login
 *     description: Allows a user to log in by providing their email and password. The endpoint validates the credentials, checks for email verification and account suspension, manages login retry limits, and issues access and refresh tokens upon successful login. Tokens are set as cookies in the response.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User logged in successfully
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
 *                         example: "admin"
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
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly"
 *             description: Sets accessToken and refreshToken as cookies
 *       401:
 *         description: Unauthorized - Invalid credentials or account issues
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
 *                   example: "Invalid credentials"
 *                   enum:
 *                     - Incomplete login data
 *                     - Invalid credentials
 *                     - Your account is not yet verified
 *                     - Your account is currently suspended
 *                     - login retries exceeded!
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
router.post('/sign-in', authController.signIn);
/**
 * @openapi
 * /auth/password/forgot:
 *   post:
 *     summary: Request password reset
 *     description: Allows a user to request a password reset by providing their email. The endpoint validates the email, checks if the user exists, ensures the password reset retry limit is not exceeded, generates a reset token, and sends a password reset link to the user's email. If retries are exceeded, the account is suspended.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "uchennadavid@gmail.com"
 *                 description: The user's email address
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
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
 *                   example: "Password reset link sent to uchennadavid@gmail.com"
 *       400:
 *         description: Bad Request - Email is required
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
 *                   example: "Email is required"
 *       401:
 *         description: Unauthorized - Password reset retries exceeded
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
 *                   example: "Password reset retries exceeded! and account suspended"
 *       404:
 *         description: Not Found - No user found with provided email
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
 *                   example: "No user found with provided email"
 */
router.post('/password/forgot', authController.forgotPassword);
/**
 * @openapi
 * /auth/password/reset:
 *   post:
 *     summary: Reset user password
 *     description: Allows a user to reset their password using a valid password reset token. The endpoint validates the token, checks if the new password matches the confirmation, ensures the new password is different from the old one, updates the user's password, and sends a confirmation email. Notifications are also added for the user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 description: The password reset token sent to the user's email
 *               password:
 *                 type: string
 *                 example: "newPassword123"
 *                 description: The new password
 *               confirmPassword:
 *                 type: string
 *                 example: "newPassword123"
 *                 description: Confirmation of the new password
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad Request - Missing fields, passwords mismatch, same as old password, or invalid/expired token
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
 *                   example: "All fields are required"
 *                   enum:
 *                     - All fields are required
 *                     - Passwords do not match
 *                     - New password cannot be the same as the old password
 *                     - Password reset token is invalid or has expired
 *                     - Password reset failed
 *       401:
 *         description: Unauthorized - Invalid token
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
 *                   example: "Invalid token"
 */
router.post('/password/reset', authController.resetPassword);
router.get('/health', authController.appHealth);

//protect all routes after this middleware
router.use(protect);
/**
 * @openapi
 * /auth/sign-out:
 *   post:
 *     summary: User logout
 *     description: Allows a logged-in user to log out by clearing their access and refresh tokens. The endpoint checks if the user is logged in and invalidates the tokens by setting expired cookies.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logout successful"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: "accessToken=expired; Path=/; HttpOnly; Max-Age=-1"
 *             description: Clears accessToken and refreshToken cookies
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
 */
router.get('/sign-out', authController.signOut);

export { router as authRouter };
