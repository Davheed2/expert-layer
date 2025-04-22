import { multerUpload } from '@/common/config';
import { requestsController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /request/create:
 *   post:
 *     summary: Create a new request
 *     description: Allows a logged-in user to create a new request for a service with optional file upload. The endpoint validates the user’s login status, required fields, service existence, and service status. It checks if the maximum request limit for the service has been reached and creates a transaction ID for the request. File uploads are processed asynchronously.
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - taskName
 *               - taskTitle
 *               - taskDescription
 *               - taskPrice
 *               - taskDetails
 *               - duration
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                 description: The ID of the service for the request
 *               taskName:
 *                 type: string
 *                 example: "Web development 3 testing"
 *                 description: The name of the task
 *               taskTitle:
 *                 type: string
 *                 example: "Web development 3"
 *                 description: The title of the task
 *               taskDescription:
 *                 type: string
 *                 example: "Web development description 3"
 *                 description: The description of the task
 *               taskPrice:
 *                 type: string
 *                 example: "1000"
 *                 description: The price of the task
 *               taskDetails:
 *                 type: string
 *                 example: "requests based on total credits detailing"
 *                 description: Additional details about the task
 *               duration:
 *                 type: string
 *                 example: "2 to 3 days"
 *                 description: The expected duration of the task
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file to attach to the request
 *     responses:
 *       201:
 *         description: Request created successfully
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
 *                         example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                       taskName:
 *                         type: string
 *                         example: "Web development 3 testing"
 *                       taskTitle:
 *                         type: string
 *                         example: "Web development 3"
 *                       taskDescription:
 *                         type: string
 *                         example: "Web development description 3"
 *                       taskDetails:
 *                         type: string
 *                         example: "requests based on total credits detailing"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000"
 *                       transactionId:
 *                         type: string
 *                         example: "TX 250423000000956"
 *                       duration:
 *                         type: string
 *                         example: "2 to 3 days"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: string
 *                         example: "200"
 *                       dueDate:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         example: "processing"
 *                       priority:
 *                         type: string
 *                         example: "none"
 *                       serviceId:
 *                         type: string
 *                         format: uuid
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "48574aea-82ea-41f5-b8d9-5ae9b4712fe9"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T23:01:18.748Z"
 *                 message:
 *                   type: string
 *                   example: "Request created successfully"
 *       400:
 *         description: Bad Request - Missing required fields or service issues
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
 *                   example: "Please provide a service ID"
 *                   enum:
 *                     - Please log in again
 *                     - Please provide a service ID
 *                     - Please provide a task name
 *                     - Please provide a task title
 *                     - Please provide a task description
 *                     - Please provide a task price
 *                     - Please provide task details
 *                     - Please provide a task duration
 *                     - Service is not active
 *                     - You have reached the maximum number of requests for this service
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
 *       500:
 *         description: Internal Server Error - Request creation failed
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
 *                   example: "Request creation failed"
 */
router.post('/create', requestsController.createRequest);
/**
 * @openapi
 * /request/user:
 *   get:
 *     summary: Retrieve all requests by user ID
 *     description: Allows a logged-in user to retrieve all their requests. The endpoint validates the user’s login status and fetches all requests associated with the user’s ID from the database, including any attached files, that are not marked as deleted.
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
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
 *                         example: "078faffa-3db7-408c-a818-365319ad9ebb"
 *                       taskName:
 *                         type: string
 *                         example: "Web development testing"
 *                       taskTitle:
 *                         type: string
 *                         example: "Web development"
 *                       taskDescription:
 *                         type: string
 *                         example: "Web development description"
 *                       taskDetails:
 *                         type: string
 *                         example: "requests based on total credits detailing"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000"
 *                       transactionId:
 *                         type: string
 *                         example: "TX25042300000000009208"
 *                       duration:
 *                         type: string
 *                         example: "2 days"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: string
 *                         example: "200"
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         example: "processing"
 *                       priority:
 *                         type: string
 *                         example: "none"
 *                       serviceId:
 *                         type: string
 *                         format: uuid
 *                         example: "20e2da32-7c5b-4755-b9f1-ca58f8c4315f"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "48574aea-82ea-41f5-b8d9-5ae9b4712fe9"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T23:12:09.531Z"
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "8d373d41-1d4e-4a91-9eaa-d3f5a3789194"
 *                             file:
 *                               type: string
 *                               example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/requests-file/1745364184380-David Okonkwo Resume .pdf"
 *                             requestId:
 *                               type: string
 *                               format: uuid
 *                               example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                             isDeleted:
 *                               type: boolean
 *                               example: false
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-22T23:23:07.502Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-22T23:23:07.502Z"
 *                 message:
 *                   type: string
 *                   example: "Requests retrieved successfully"
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
 *         description: Not Found - No requests found
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
 *                   example: "No request found"
 */
router.get('/user', requestsController.findByUserId);
/**
 * @openapi
 * /request/find:
 *   get:
 *     summary: Retrieve a request by ID
 *     description: Allows a logged-in user to retrieve a specific request by its ID. The endpoint validates the user’s login status, ensures a request ID is provided, and fetches the request from the database along with any associated files, if it exists and is not marked as deleted.
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *         description: The ID of the request to retrieve
 *     responses:
 *       200:
 *         description: Request retrieved successfully
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
 *                         example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                       taskName:
 *                         type: string
 *                         example: "Web development 3 testing"
 *                       taskTitle:
 *                         type: string
 *                         example: "Web development 3"
 *                       taskDescription:
 *                         type: string
 *                         example: "Web development description 3"
 *                       taskDetails:
 *                         type: string
 *                         example: "requests based on total credits detailing"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000"
 *                       transactionId:
 *                         type: string
 *                         example: "TX 250423000000956"
 *                       duration:
 *                         type: string
 *                         example: "2 to 3 days"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: string
 *                         example: "200"
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-05-21T23:00:00.000Z"
 *                       status:
 *                         type: string
 *                         example: "processing"
 *                       priority:
 *                         type: string
 *                         example: "high"
 *                       serviceId:
 *                         type: string
 *                         format: uuid
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "48574aea-82ea-41f5-b8d9-5ae9b4712fe9"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T23:01:18.748Z"
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "8d373d41-1d4e-4a91-9eaa-d3f5a3789194"
 *                             file:
 *                               type: string
 *                               example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/requests-file/1745364184380-David Okonkwo Resume .pdf"
 *                             requestId:
 *                               type: string
 *                               format: uuid
 *                               example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                             isDeleted:
 *                               type: boolean
 *                               example: false
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-22T23:23:07.502Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-04-22T23:23:07.502Z"
 *                 message:
 *                   type: string
 *                   example: "Request retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in or missing request ID
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
 *                     - Please provide a request ID
 *       404:
 *         description: Not Found - Request not found
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
 *                   example: "Request not found"
 */
router.get('/find', requestsController.findRequestById);
/**
 * @openapi
 * /request/update:
 *   post:
 *     summary: Update an existing request
 *     description: Allows an admin user to update an existing request with optional file upload. The endpoint validates the user’s login status, admin role, and ensures the request ID is provided and exists. It supports partial updates for fields like credits, status, priority, and due date, with validation for numeric credits and valid date formats. File uploads are processed asynchronously.
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *                 format: uuid
 *                 example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                 description: The ID of the request to update
 *               credits:
 *                 type: number
 *                 example: 200
 *                 description: The updated number of credits for the request (optional)
 *               status:
 *                 type: string
 *                 example: "processing"
 *                 description: The updated status of the request (optional)
 *               priority:
 *                 type: string
 *                 example: "high"
 *                 description: The updated priority of the request (optional)
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-21T23:00:00.000Z"
 *                 description: The updated due date for the request (optional)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file to attach to the request
 *     responses:
 *       200:
 *         description: Request updated successfully
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
 *                         example: "cfd4af4c-46ff-419d-9b81-54641280f78c"
 *                       taskName:
 *                         type: string
 *                         example: "Web development 3 testing"
 *                       taskTitle:
 *                         type: string
 *                         example: "Web development 3"
 *                       taskDescription:
 *                         type: string
 *                         example: "Web development description 3"
 *                       taskDetails:
 *                         type: string
 *                         example: "requests based on total credits detailing"
 *                       taskPrice:
 *                         type: string
 *                         example: "1000"
 *                       transactionId:
 *                         type: string
 *                         example: "TX 250423000000956"
 *                       duration:
 *                         type: string
 *                         example: "2 to 3 days"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: string
 *                         example: "200"
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-05-21T23:00:00.000Z"
 *                       status:
 *                         type: string
 *                         example: "processing"
 *                       priority:
 *                         type: string
 *                         example: "high"
 *                       serviceId:
 *                         type: string
 *                         format: uuid
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "48574aea-82ea-41f5-b8d9-5ae9b4712fe9"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T23:01:18.748Z"
 *                 message:
 *                   type: string
 *                   example: "Request updated successfully"
 *       400:
 *         description: Bad Request - Missing or invalid required fields
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
 *                   example: "Request ID is required"
 *                   enum:
 *                     - Please log in again
 *                     - Request ID is required
 *                     - Credits must be a number
 *                     - Invalid due date format
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
 *                   example: "You are not authorized to update this request"
 *       404:
 *         description: Not Found - Request not found
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
 *                   example: "Request not found"
 *       500:
 *         description: Internal Server Error - Request update failed
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
 *                   example: "Request update failed"
 */
router.post('/update', multerUpload.single('requestFile'), requestsController.updateRequest);
/**
 * @openapi
 * /request/delete-file:
 *   post:
 *     summary: Delete a request file
 *     description: Allows an admin user to delete a file associated with a request. The endpoint validates the user’s login status, admin role, and ensures the request file ID is provided. It checks if the file exists, deletes it from the storage (R2), and removes the file record from the database.
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestFileId
 *             properties:
 *               requestFileId:
 *                 type: string
 *                 format: uuid
 *                 example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                 description: The ID of the request file to delete
 *     responses:
 *       200:
 *         description: Request file deleted successfully
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
 *                   example: "Request file deleted successfully"
 *       400:
 *         description: Bad Request - Missing request file ID or user not logged in
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
 *                   example: "Request file ID is required"
 *                   enum:
 *                     - Please log in again
 *                     - Request file ID is required
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
 *                   example: "You are not authorized to delete this request file"
 *       404:
 *         description: Not Found - Request file not found
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
 *                   example: "Request file not found"
 *       500:
 *         description: Internal Server Error - Request file deletion failed
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
 *                   example: "Request file deletion failed"
 *                   enum:
 *                     - Request file deletion failed
 *                     - Failed to delete the existing document.
 */
router.post('/delete-file', requestsController.deleteRequestFile);
export { router as requestRouter };
