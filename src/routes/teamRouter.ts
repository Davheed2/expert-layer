import { protect } from '@/middlewares/protect';
import express from 'express';
import { teamController } from '@/controllers';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /team/all:
 *   get:
 *     summary: Retrieve all teams
 *     description: Allows an admin user to retrieve a list of all teams. The endpoint validates the user’s login status and admin role, then fetches all teams from the database that are not marked as deleted.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
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
 *                         example: "f6b4f4a2-8e5d-4ac7-8753-bdac9399152b"
 *                       name:
 *                         type: string
 *                         example: "David David's Organization"
 *                       ownerId:
 *                         type: string
 *                         format: uuid
 *                         example: "52179bc8-dc7e-49f8-8f14-c9cd7f8d7513"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-20T18:08:43.521Z"
 *                 message:
 *                   type: string
 *                   example: "Teams retrieved successfully"
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
 *       403:
 *         description: Forbidden - User is not an admin
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
 *                   example: "You do not have permission to access this resource"
 */
router.get('/all', teamController.getAllTeams);
/**
 * @openapi
 * /team/add-member:
 *   post:
 *     summary: Add a member to a team
 *     description: Allows an admin user who owns the team to add a new member to a specified team. The endpoint validates the user’s login status, admin role, team ownership, and ensures both team ID and user ID are provided. It checks if the team and user exist, verifies that the user is not already a team member, and adds the new member to the team.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - userId
 *             properties:
 *               teamId:
 *                 type: string
 *                 format: uuid
 *                 example: "f6b4f4a2-8e5d-4ac7-8753-bdac9399152b"
 *                 description: The ID of the team to add the member to
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                 description: The ID of the user to add as a team member
 *     responses:
 *       201:
 *         description: Team member added successfully
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
 *                         example: "6b15b401-0cf4-4d8f-83ef-b181bf8238dc"
 *                       teamId:
 *                         type: string
 *                         format: uuid
 *                         example: "f6b4f4a2-8e5d-4ac7-8753-bdac9399152b"
 *                       ownerId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       memberId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       memberType:
 *                         type: string
 *                         example: "admin"
 *                         description: The role of the member in the team
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-20T18:19:07.738Z"
 *                 message:
 *                   type: string
 *                   example: "Team member added successfully"
 *       400:
 *         description: Bad Request - Missing team ID, user ID, or user already a team member
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
 *                   example: "Team ID and User ID are required"
 *                   enum:
 *                     - Please log in again
 *                     - Team ID and User ID are required
 *                     - User is already a member of the team
 *       403:
 *         description: Forbidden - User is not an admin or does not own the team
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
 *                   example: "You do not have permission to access this resource"
 *       404:
 *         description: Not Found - Team or user not found
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
 *                   example: "Team not found"
 *                   enum:
 *                     - Team not found
 *                     - User not found
 *       500:
 *         description: Internal Server Error - Failed to add team member
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
 *                   example: "Failed to add team member"
 */
router.post('/add-member', teamController.addTeamMember);
/**
 * @openapi
 * /team/all-team-members:
 *   get:
 *     summary: Retrieve all teams with their members
 *     description: Allows an admin user to retrieve a list of all teams along with their members. The endpoint validates the user’s login status and admin role, then fetches all teams and their associated members from the database that are not marked as deleted.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teams with members retrieved successfully
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
 *                         example: "f6b4f4a2-8e5d-4ac7-8753-bdac9399152b"
 *                       name:
 *                         type: string
 *                         example: "David David's Organization"
 *                       ownerId:
 *                         type: string
 *                         format: uuid
 *                         example: "52179bc8-dc7e-49f8-8f14-c9cd7f8d7513"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-20T18:08:43.521Z"
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "6b15b401-0cf4-4d8f-83ef-b181bf8238dc"
 *                             teamId:
 *                               type: string
 *                               format: uuid
 *                               example: "f6b4f4a2-8e5d-4ac7-8753-bdac9399152b"
 *                             ownerId:
 *                               type: string
 *                               format: uuid
 *                               nullable: true
 *                               example: null
 *                             memberId:
 *                               type: string
 *                               format: uuid
 *                               example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                             memberType:
 *                               type: string
 *                               example: "admin"
 *                             isDeleted:
 *                               type: boolean
 *                               example: false
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-20T18:19:07.738Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-20T18:19:07.738Z"
 *                 message:
 *                   type: string
 *                   example: "Teams with members retrieved successfully"
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
 *       403:
 *         description: Forbidden - User is not an admin
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
 *                   example: "You do not have permission to access this resource"
 */
router.get('/all-team-members', teamController.fetchTeamsWithMembers);

router.get('/chat/teams', teamController.getUserTeamsHandler);

export { router as teamsRouter };
