import { multerUpload } from '@/common/config';
import { tasksController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

router.post('/create', multerUpload.single('taskImage'), tasksController.createTask);
router.post('/create-details', tasksController.createTaskDetails);
/**
 * @openapi
 * /tasks/create-:
 *   post:
 *     summary: Create a new task with details
 *     description: Allows an admin user to create a new task and its associated details. Requires authentication via a valid access token and a file upload (task image). The endpoint validates the user’s admin role, checks for required fields, ensures the task does not already exist, uploads the task image to cloud storage, and creates both the task and its details in the database.
 *     tags:
 *       - Tasks
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
 *               - task
 *               - title
 *               - description
 *               - amount
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the task
 *               task:
 *                 type: string
 *                 example: "Testing task"
 *                 description: The name of the task
 *               title:
 *                 type: string
 *                 example: "Titled task"
 *                 description: The title of the task details
 *               description:
 *                 type: string
 *                 example: "Titled task description"
 *                 description: The description of the task details
 *               amount:
 *                 type: string
 *                 example: "1000.00"
 *                 description: The amount associated with the task
 *               popular:
 *                 type: boolean
 *                 example: true
 *                 description: Indicates if the task is popular (optional)
 *     responses:
 *       201:
 *         description: Task and task details created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "3c3806ff-c401-4753-a855-472286fb39aa"
 *                           task:
 *                             type: string
 *                             example: "Testing task"
 *                           taskImage:
 *                             type: string
 *                             example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/tasks-image/1745058951204-100minds.jpg"
 *                           isDeleted:
 *                             type: boolean
 *                             example: false
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-19T10:35:53.162Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-19T10:35:53.162Z"
 *                     taskDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "63cc75e4-eff3-4108-8a5b-a988a73f7341"
 *                           taskId:
 *                             type: string
 *                             format: uuid
 *                             example: "3c3806ff-c401-4753-a855-472286fb39aa"
 *                           title:
 *                             type: string
 *                             example: "Titled task"
 *                           description:
 *                             type: string
 *                             example: "Titled task description"
 *                           amount:
 *                             type: string
 *                             example: "1000.00"
 *                           popular:
 *                             type: boolean
 *                             example: true
 *                           isDeleted:
 *                             type: boolean
 *                             example: false
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-19T10:35:53.172Z"
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-19T10:35:53.172Z"
 *                 message:
 *                   type: string
 *                   example: "Task and task details created successfully"
 *       400:
 *         description: Bad Request - Validation errors
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
 *                   example: "Please provide a task name"
 *                   enum:
 *                     - Please log in again
 *                     - File is required
 *                     - Please provide a task name
 *                     - Please provide a title
 *                     - Please provide a description
 *                     - Please provide an amount
 *                     - Task already exists
 *       401:
 *         description: Unauthorized - User not authorized
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
 *                   example: "You are not authorized to create tasks or task details"
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
 *         description: Internal Server Error - Failed to create task or task details
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
 *                   example: "Failed to create task"
 *                   enum:
 *                     - Failed to create task
 *                     - Failed to create task details
 */
router.post('/create-tasks-details', multerUpload.single('taskImage'), tasksController.createTaskWithDetails);
/**
 * @openapi
 * /tasks/all:
 *   get:
 *     summary: Retrieve all tasks
 *     description: Allows a logged-in user to retrieve a list of all tasks. Requires authentication via a valid access token. The endpoint checks if the user is logged in and fetches all tasks from the database that are not marked as deleted.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
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
 *                         example: "21218c3e-7476-4e83-8864-2016ceaba42c"
 *                       task:
 *                         type: string
 *                         example: "Testing task 2"
 *                       taskImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/tasks-image/1745059434458-100minds.jpg"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T10:43:55.875Z"
 *                 message:
 *                   type: string
 *                   example: "Tasks retrieved successfully"
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
 *         description: Not Found - No tasks found
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
 *                   example: "No tasks found"
 */
router.get('/all', tasksController.findAllTasks);
/**
 * @openapi
 * /tasks/all-task-with-details:
 *   get:
 *     summary: Retrieve all tasks with their details
 *     description: Allows a logged-in user to retrieve a list of all tasks along with their associated details. Requires authentication via a valid access token. The endpoint checks if the user is logged in and fetches all tasks with their details from the database that are not marked as deleted.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks with details retrieved successfully
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
 *                         example: "21218c3e-7476-4e83-8864-2016ceaba42c"
 *                       task:
 *                         type: string
 *                         example: "Testing task 2"
 *                       taskImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/tasks-image/1745059434458-100minds.jpg"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T10:43:55.875Z"
 *                       details:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "10671010-bb45-49af-a8d9-2308386759f5"
 *                             taskId:
 *                               type: string
 *                               format: uuid
 *                               example: "21218c3e-7476-4e83-8864-2016ceaba42c"
 *                             title:
 *                               type: string
 *                               example: "Titled task"
 *                             description:
 *                               type: string
 *                               example: "Titled task description"
 *                             amount:
 *                               type: number
 *                               example: 1000
 *                             popular:
 *                               type: boolean
 *                               example: true
 *                             isDeleted:
 *                               type: boolean
 *                               example: false
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-19T10:43:55.900Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-19T10:43:55.900Z"
 *                 message:
 *                   type: string
 *                   example: "Tasks with details retrieved successfully"
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
 *         description: Not Found - No tasks found
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
 *                   example: "No tasks found"
 */
router.get('/all-task-with-details', tasksController.findAllTasksWithDetails);
/**
 * @openapi
 * /tasks/all-details:
 *   get:
 *     summary: Retrieve all task details
 *     description: Allows a logged-in user to retrieve a list of all task details. Requires authentication via a valid access token. The endpoint checks if the user is logged in and fetches all task details from the database that are not marked as deleted.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
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
 *                         example: "10671010-bb45-49af-a8d9-2308386759f5"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         example: "21218c3e-7476-4e83-8864-2016ceaba42c"
 *                       title:
 *                         type: string
 *                         example: "Titled task"
 *                       description:
 *                         type: string
 *                         example: "Titled task description"
 *                       amount:
 *                         type: string
 *                         example: "1000.00"
 *                       popular:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T10:43:55.900Z"
 *                 message:
 *                   type: string
 *                   example: "Task details retrieved successfully"
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
 *         description: Not Found - No task details found
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
 *                   example: "No task details found"
 */
router.get('/all-details', tasksController.findAllTaskDetails);
/**
 * @openapi
 * /tasks/popular-details:
 *   get:
 *     summary: Retrieve all popular task details
 *     description: Allows a logged-in user to retrieve a list of all task details marked as popular. Requires authentication via a valid access token. The endpoint checks if the user is logged in and fetches all popular task details from the database that are not marked as deleted.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popular task details retrieved successfully
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
 *                         example: "10671010-bb45-49af-a8d9-2308386759f5"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         example: "21218c3e-7476-4e83-8864-2016ceaba42c"
 *                       title:
 *                         type: string
 *                         example: "Titled task"
 *                       description:
 *                         type: string
 *                         example: "Titled task description"
 *                       amount:
 *                         type: string
 *                         example: "1000.00"
 *                       popular:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T10:43:55.900Z"
 *                 message:
 *                   type: string
 *                   example: "Popular task details retrieved successfully"
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
 *         description: Not Found - No popular task details found
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
 *                   example: "No popular task details found"
 */
router.get('/popular-details', tasksController.findPopularTaskDetails);

export { router as tasksRouter };
