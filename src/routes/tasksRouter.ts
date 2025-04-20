import { multerUpload } from '@/common/config';
import { tasksController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /tasks/create:
 *   post:
 *     summary: Create a new task
 *     description: Allows an admin user to create a new task with an associated image. The endpoint validates the user’s login status, admin role, ensures a task name and image file are provided, checks for duplicate tasks, uploads the image to cloud storage, and creates the task in the database.
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
 *               - task
 *               - file
 *             properties:
 *               task:
 *                 type: string
 *                 example: "A new task added"
 *                 description: The name of the task
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the task
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *                         example: "39ad06a4-2c97-48e6-be7d-6ced8cc9681d"
 *                       task:
 *                         type: string
 *                         example: "A new task added"
 *                       taskImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/tasks-image/1745105305641-100minds.jpg"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T23:28:26.893Z"
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *       400:
 *         description: Bad Request - Missing required fields, task already exists, or user not found
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
 *                     - Please provide a task name
 *                     - Task already exists
 *       401:
 *         description: Unauthorized - User is not an admin
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
 *                   example: "You are not authorized to create tasks"
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
router.post('/create', multerUpload.single('taskImage'), tasksController.createTask);
/**
 * @openapi
 * /tasks/create-details:
 *   post:
 *     summary: Create new task details
 *     description: Allows an admin user to create new task details for a specific task. The endpoint validates the user’s login status, admin role, and ensures all required fields (task ID, title, description, amount) are provided. It also checks if the user and task exist before creating the task details in the database.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - title
 *               - description
 *               - amount
 *             properties:
 *               taskId:
 *                 type: string
 *                 format: uuid
 *                 example: "39ad06a4-2c97-48e6-be7d-6ced8cc9681d"
 *                 description: The ID of the task to associate with the details
 *               title:
 *                 type: string
 *                 example: "New title"
 *                 description: The title of the task details
 *               description:
 *                 type: string
 *                 example: "description"
 *                 description: The description of the task details
 *               amount:
 *                 type: string
 *                 example: "1000.00"
 *                 description: The amount associated with the task details
 *               popular:
 *                 type: boolean
 *                 example: false
 *                 description: Indicates if the task details are marked as popular (optional)
 *     responses:
 *       201:
 *         description: Task details created successfully
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
 *                         example: "d0890ab2-87b3-465f-9085-db417b2fa131"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         example: "39ad06a4-2c97-48e6-be7d-6ced8cc9681d"
 *                       title:
 *                         type: string
 *                         example: "New title"
 *                       description:
 *                         type: string
 *                         example: "description"
 *                       amount:
 *                         type: string
 *                         example: "1000.00"
 *                       popular:
 *                         type: boolean
 *                         example: false
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T23:31:30.006Z"
 *                 message:
 *                   type: string
 *                   example: "Task details created successfully"
 *       400:
 *         description: Bad Request - Missing required fields
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
 *                     - Please provide a task ID
 *                     - Please provide a title
 *                     - Please provide a description
 *                     - Please provide an amount
 *       401:
 *         description: Unauthorized - User is not an admin
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
 *                   example: "You are not authorized to create task details"
 *       404:
 *         description: Not Found - User or task not found
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
 *                   enum:
 *                     - User not found
 *                     - Task not found
 */
router.post('/create-details', tasksController.createTaskDetails);

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
