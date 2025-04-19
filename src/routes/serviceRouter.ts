import { servicesController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import { multerUpload } from '@/common/config';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /services/create:
 *   post:
 *     summary: Create a new service
 *     description: Allows a logged-in user to create a new service with associated task details and images. The endpoint validates the user’s login status, ensures all required fields and a service image are provided, uploads the service image to cloud storage, and creates the service in the database. Optionally, a reference document can be uploaded and updated asynchronously.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - serviceImage
 *               - name
 *               - description
 *               - taskName
 *               - taskTitle
 *               - taskDescription
 *               - taskPrice
 *               - taskDetails
 *               - duration
 *             properties:
 *               serviceImage:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the service
 *               resources:
 *                 type: string
 *                 format: binary
 *                 description: Optional reference image for the service
 *               name:
 *                 type: string
 *                 example: "First Service"
 *                 description: The name of the service
 *               description:
 *                 type: string
 *                 example: "A test"
 *                 description: The description of the service
 *               taskId:
 *                 type: string
 *                 format: uuid
 *                 example: null
 *                 description: The ID of the associated task (optional)
 *               taskName:
 *                 type: string
 *                 example: "Software development"
 *                 description: The name of the task
 *               taskTitle:
 *                 type: string
 *                 example: "Vigo web"
 *                 description: The title of the task
 *               taskDescription:
 *                 type: string
 *                 example: "Fintech app"
 *                 description: The description of the task
 *               taskPrice:
 *                 type: string
 *                 example: "1000.00"
 *                 description: The price of the task
 *               taskDetails:
 *                 type: string
 *                 example: "I want to build a fintech product"
 *                 description: Additional details about the task
 *               reference:
 *                 type: string
 *                 example: null
 *                 description: Optional reference information for the service
 *               duration:
 *                 type: string
 *                 example: "2 - 3 days"
 *                 description: The duration required to complete the task
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                         example: "1bcc34b7-0070-449a-a12c-7beb843eb001"
 *                       name:
 *                         type: string
 *                         example: "First Service"
 *                       description:
 *                         type: string
 *                         example: "A test"
 *                       serviceImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/services-image/1745096094535-100minds.jpg"
 *                       taskName:
 *                         type: string
 *                         example: "Software development"
 *                       taskTitle:
 *                         type: string
 *                         example: "Vigo web"
 *                       taskDescription:
 *                         type: string
 *                         example: "Fintech app"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000.00"
 *                       taskDetails:
 *                         type: string
 *                         example: "I want to build a fintech product"
 *                       reference:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       duration:
 *                         type: string
 *                         example: "2 - 3 days"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T20:54:55.481Z"
 *                 message:
 *                   type: string
 *                   example: "Service created successfully"
 *       400:
 *         description: Bad Request - Missing required fields or invalid user
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
 *                     - service image is required
 *                     - Please provide a service name
 *                     - Please provide a service description
 *                     - Please provide a task name
 *                     - Please provide a task title
 *                     - Please provide a task description
 *                     - Please provide a task price
 *                     - Please provide task details
 *                     - Please provide a task duration
 *                     - Please provide a service image
 *       500:
 *         description: Internal Server Error - Failed to create service
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
 *                   example: "Service creation failed"
 */
router.post(
	'/create',
	multerUpload.fields([
		{ name: 'serviceImage', maxCount: 1 },
		{ name: 'resources', maxCount: 1 },
	]),
	servicesController.createService
);
/**
 * @openapi
 * /services:
 *   get:
 *     summary: Retrieve all services
 *     description: Allows an admin user to retrieve a list of all services. The endpoint validates the user’s login status and admin role, then fetches all services from the database that are not marked as deleted.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                         example: "1bcc34b7-0070-449a-a12c-7beb843eb001"
 *                       name:
 *                         type: string
 *                         example: "First Service"
 *                       description:
 *                         type: string
 *                         example: "A test"
 *                       serviceImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/services-image/1745096094535-100minds.jpg"
 *                       taskName:
 *                         type: string
 *                         example: "Software development"
 *                       taskTitle:
 *                         type: string
 *                         example: "Vigo web"
 *                       taskDescription:
 *                         type: string
 *                         example: "Fintech app"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000.00"
 *                       taskDetails:
 *                         type: string
 *                         example: "I want to build a fintech product"
 *                       reference:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       duration:
 *                         type: string
 *                         example: "2 - 3 days"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T20:54:55.481Z"
 *                 message:
 *                   type: string
 *                   example: "Services retrieved successfully"
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
 *                   example: "You are not authorized to view all services"
 *       404:
 *         description: Not Found - No services found
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
 *                   example: "No services found"
 */
router.get('/all', servicesController.findAllServices);
/**
 * @openapi
 * /service/id:
 *   get:
 *     summary: Retrieve a service by ID
 *     description: Allows a logged-in user to retrieve a specific service by its ID. The endpoint validates the user’s login status, ensures a service ID is provided, and fetches the service from the database if it is not marked as deleted.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "1bcc34b7-0070-449a-a12c-7beb843eb001"
 *         description: The ID of the service to retrieve
 *     responses:
 *       200:
 *         description: Service retrieved successfully
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
 *                         example: "1bcc34b7-0070-449a-a12c-7beb843eb001"
 *                       name:
 *                         type: string
 *                         example: "First Service"
 *                       description:
 *                         type: string
 *                         example: "A test"
 *                       serviceImage:
 *                         type: string
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/services-image/1745096094535-100minds.jpg"
 *                       taskName:
 *                         type: string
 *                         example: "Software development"
 *                       taskTitle:
 *                         type: string
 *                         example: "Vigo web"
 *                       taskDescription:
 *                         type: string
 *                         example: "Fintech app"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000.00"
 *                       taskDetails:
 *                         type: string
 *                         example: "I want to build a fintech product"
 *                       reference:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       duration:
 *                         type: string
 *                         example: "2 - 3 days"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "eb1bde91-941c-4d68-ba88-5887fc7d9255"
 *                       taskId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                         example: null
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-19T20:54:55.481Z"
 *                 message:
 *                   type: string
 *                   example: "Service retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in or service ID not provided
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
 *                     - Please provide a service ID
 *       404:
 *         description: Not Found - Service not found
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
 *                   example: "Service not found"
 */
router.get('/id', servicesController.findServiceById);

export { router as serviceRouter };
