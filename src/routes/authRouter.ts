import { authController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     summary: Sign up a new user
 *     description: Allows a new user to sign up by providing their email, first name, last name, and role. The endpoint validates the input data, checks if the email is already in use, generates a verification token, sends a verification email, and creates a user record with a pending verification status.
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
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The email address of the new user
 *               firstName:
 *                 type: string
 *                 example: "David"
 *                 description: The first name of the new user
 *               lastName:
 *                 type: string
 *                 example: "David"
 *                 description: The last name of the new user
 *               role:
 *                 type: string
 *                 example: "admin"
 *                 description: The role to assign to the new user
 *     responses:
 *       201:
 *         description: Verification link sent successfully
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
 *                         example: "bbeb8a73-8a81-4041-824f-e039c20e4b5c"
 *                       firstName:
 *                         type: string
 *                         example: "David"
 *                       lastName:
 *                         type: string
 *                         example: "David"
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
 *                       loginToken:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       loginTokenExpires:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T16:54:57.397Z"
 *                 message:
 *                   type: string
 *                   example: "Verification link sent to uchennadavid2404@gmail.com"
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
 *     description: Verifies a user’s account using a verification token provided in the query. The endpoint validates the token, checks if the user exists, ensures the account is not already verified, confirms the token is unused and unexpired, updates the user’s verification status, sends a welcome email, creates a notification, and automatically creates a team for the user. It also notifies admins of the new user registration.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: verificationToken
 *         required: true
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6InJhbmRvbVRva2VuIiwiaWF0IjoxNzI5NjQyNzI3LCJleHAiOjE3MzIyMzQ3Mjd9.2bX8..."
 *         description: The verification token sent to the user’s email
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
 *                         example: "bbeb8a73-8a81-4041-824f-e039c20e4b5c"
 *                       firstName:
 *                         type: string
 *                         example: "David"
 *                       lastName:
 *                         type: string
 *                         example: "David"
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
 *                       loginToken:
 *                         type: string
 *                         nullable: true
 *                         example: "421aee9c5a7ad75e9d050c46605e1acbe80c21023544b2a6dd028ef6fdddb7d6"
 *                       loginTokenExpires:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-04-22T19:56:33.659Z"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T16:54:57.397Z"
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       400:
 *         description: Bad Request - Missing, invalid, already used, or expired token
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
 *     summary: Sign in a user
 *     description: Allows a user to sign in by requesting a magic link sent to their email. The endpoint validates the provided email, checks if the user exists, verifies their account status (email verification and suspension), ensures no recent login attempts within the last minute, generates a login token, and sends a magic link to the user’s email.
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
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The email address of the user attempting to sign in
 *     responses:
 *       200:
 *         description: Login link sent successfully
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
 *                   example: "Login link sent to your email"
 *       401:
 *         description: Unauthorized - Incomplete data, unverified account, or suspended account
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
 *                   example: "Incomplete login data"
 *                   enum:
 *                     - Incomplete login data
 *                     - Your account is not yet verified
 *                     - Your account is currently suspended
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
 *       429:
 *         description: Too Many Requests - Login request sent too recently
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
 *                   example: "Please wait before requesting another login link"
 */
router.post('/sign-in', authController.signIn);
/**
 * @openapi
 * /auth/verify-login:
 *   get:
 *     summary: Verify user login
 *     description: Verifies a user’s login attempt using a login token provided in the query. The endpoint validates the token, checks if the user exists, ensures the token is valid and unexpired, generates access and refresh tokens, sets them as cookies, clears the login token, updates the last login time, sends a login confirmation email, and returns the user data.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6InJhbmRvbVRva2VuIiwiaWF0IjoxNzI5NjQyNzI3LCJleHAiOjE3Mjk2NDM2Mjd9.3cY8..."
 *         description: The login token sent to the user’s email
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
 *                         example: "bbeb8a73-8a81-4041-824f-e039c20e4b5c"
 *                       firstName:
 *                         type: string
 *                         example: "David"
 *                       lastName:
 *                         type: string
 *                         example: "David"
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
 *                       loginToken:
 *                         type: string
 *                         nullable: true
 *                         example: "21f943b11abfe5d3f20e8abe73595d61d2950ea1f5ba2c9f356243e7a1596f30"
 *                       loginTokenExpires:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-04-22T20:28:35.282Z"
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T16:54:57.397Z"
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *       400:
 *         description: Bad Request - Missing or expired login token
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
 *                   example: "Login token is required"
 *                   enum:
 *                     - Login token is required
 *                     - Login token has expired
 *       401:
 *         description: Unauthorized - Invalid login token
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
 *                   example: "Invalid login token"
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
router.post('/verify-login', authController.verifyLogin);
router.get('/health', authController.appHealth);

//protect all routes after this middleware
router.use(protect);
/**
 * @openapi
 * /auth/sign-out:
 *   get:
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
