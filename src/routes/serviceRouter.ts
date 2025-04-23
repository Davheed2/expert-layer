import { servicesController } from '@/controllers';
import { protect } from '@/middlewares/protect';
import { multerUpload } from '@/common/config';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /service/create:
 *   post:
 *     summary: Create a new service
 *     description: Allows an admin user to create a new service with optional image upload. The endpoint validates the user’s login status, admin role, and required fields (name, description, price, type, category, pricing details, and default status). It also ensures specific fields are provided based on pricing details (credits or hours, allocation) and handles image upload asynchronously after service creation.
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
 *               - name
 *               - description
 *               - price
 *               - type
 *               - category
 *               - pricingDetails
 *               - isDefault
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Service Name"
 *                 description: The name of the service
 *               description:
 *                 type: string
 *                 example: "Service description"
 *                 description: The description of the service
 *               price:
 *                 type: string
 *                 example: "1000.00"
 *                 description: The price of the service
 *               credits:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The number of credits for the service (required if pricingDetails is 'credits')
 *               hours:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The number of hours for the service (required if pricingDetails is 'timebased')
 *               pricingDetails:
 *                 type: string
 *                 example: "standard"
 *                 description: The pricing model of the service (e.g., standard, credits, timebased)
 *               purchaseLimit:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The purchase limit for the service (optional)
 *               allocation:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *                 description: The allocation type for credits or requests (required if pricingDetails is 'credits' or 'timebased')
 *               maxRequest:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The maximum number of requests allowed for the service (required as a number if allocation is 'fixed amount')
 *               isDefault:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *                 description: Indicates if the service is set as default
 *               type:
 *                 type: string
 *                 example: "one_off"
 *                 description: The type of service (e.g., one_off, subscription)
 *               category:
 *                 type: string
 *                 example: "development"
 *                 description: The category of the service
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the service (optional)
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
 *                         example: "f5a93e18-8815-4a7c-8875-5cbb74fdbc78"
 *                       name:
 *                         type: string
 *                         example: "Service Name"
 *                       description:
 *                         type: string
 *                         example: "Service description"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         example: "draft"
 *                       type:
 *                         type: string
 *                         example: "one_off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "standard"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       category:
 *                         type: string
 *                         example: "development"
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       isDefault:
 *                         type: boolean
 *                         example: true
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
 *                         example: "2025-04-23T23:26:50.437Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-23T23:26:50.437Z"
 *                 message:
 *                   type: string
 *                   example: "Service created successfully"
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
 *                   example: "Please provide a service name"
 *                   enum:
 *                     - Please log in again
 *                     - Please provide a service name
 *                     - Please provide a service description
 *                     - Please provide a service type
 *                     - Please provide a service price
 *                     - Please provide a service category
 *                     - Please provide service pricing details
 *                     - Please provide credits
 *                     - Please provide hours
 *                     - Please provide credits allocation
 *                     - Please provide requests allocation
 *                     - Service default status must be a boolean
 *                     - Service max request must be a number
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
 *                   example: "You are not authorized to create a service"
 *       500:
 *         description: Internal Server Error - Service creation failed
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
router.post('/create', multerUpload.single('serviceImage'), servicesController.createService);
/**
 * @openapi
 * /service/find-paginated:
 *   get:
 *     summary: Retrieve paginated services
 *     description: Allows a logged-in user to retrieve a paginated list of services. The endpoint validates the user’s login status and fetches services from the database based on the provided page number and page size. If not provided, it defaults to 10 services per page and the first page.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: string
 *           example: "10"
 *         description: Number of services per page (defaults to 10 if not provided)
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           example: "1"
 *         description: Page number to retrieve (defaults to 1 if not provided)
 *     responses:
 *       200:
 *         description: Paginated Services retrieved successfully
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
 *                         example: "f5a93e18-8815-4a7c-8875-5cbb74fdbc78"
 *                       name:
 *                         type: string
 *                         example: "Service Name"
 *                       description:
 *                         type: string
 *                         example: "Service description"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         example: "draft"
 *                       type:
 *                         type: string
 *                         example: "one_off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "standard"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       category:
 *                         type: string
 *                         example: "development"
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       isDefault:
 *                         type: boolean
 *                         example: true
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
 *                         example: "2025-04-23T23:26:50.437Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-23T23:26:50.437Z"
 *                 message:
 *                   type: string
 *                   example: "Paginated Services retrieved successfully"
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
 *                   example: "No service found"
 */
router.get('/find-paginated', servicesController.getPaginatedServices);
/**
 * @openapi
 * /service/admin-all:
 *   get:
 *     summary: Retrieve all services
 *     description: Allows an admin user to retrieve a list of all services. The endpoint validates the user’s login status and admin role, then fetches all services from the database that are not marked as deleted and also have a status of draft.
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
 *                         example: "6450618d-04b6-470f-96ba-652a77ad719c"
 *                       name:
 *                         type: string
 *                         example: "Web development 3"
 *                       description:
 *                         type: string
 *                         example: "Web development description 3"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: 200
 *                       status:
 *                         type: string
 *                         example: "draft"
 *                       type:
 *                         type: string
 *                         example: "one off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "credits"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: "requests based on total credits"
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: 1
 *                       isDefault:
 *                         type: boolean
 *                         example: true
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
 *                         example: "2025-04-22T22:12:13.971Z"
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
router.get('/admin-all', servicesController.findAllServices);
/**
 * @openapi
 * /service/client-all:
 *   get:
 *     summary: Retrieve all active services for clients
 *     description: Allows a logged-in user to retrieve a list of all active services. The endpoint validates the user’s login status and fetches all services with an active status from the database that are not marked as deleted.
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
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       name:
 *                         type: string
 *                         example: "Web development 3"
 *                       description:
 *                         type: string
 *                         example: "Web development description 3"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: 200
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       type:
 *                         type: string
 *                         example: "one off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "standard"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       isDefault:
 *                         type: boolean
 *                         example: false
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
 *                         example: "2025-04-22T22:10:35.077Z"
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
router.get('/client-all', servicesController.findClientServices);
/**
 * @openapi
 * /service/find:
 *   get:
 *     summary: Retrieve a service by ID
 *     description: Allows a logged-in user to retrieve a specific service by its ID. The endpoint validates the user’s login status, ensures a service ID is provided, and fetches the service from the database if it exists and is not marked as deleted.
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
 *           example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
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
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       name:
 *                         type: string
 *                         example: "Web development 3"
 *                       description:
 *                         type: string
 *                         example: "Web development description 3"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: 200
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       type:
 *                         type: string
 *                         example: "one off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "standard"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       isDefault:
 *                         type: boolean
 *                         example: false
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
 *                         example: "2025-04-22T22:10:35.077Z"
 *                 message:
 *                   type: string
 *                   example: "Service retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in or missing service ID
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
router.get('/find', servicesController.findServiceById);
/**
 * @openapi
 * /service/update:
 *   post:
 *     summary: Update a service
 *     description: Allows an admin user to update an existing service with optional image upload. The endpoint validates the user’s login status, admin role, and ensures the service exists. It supports partial updates for fields like name, description, price, type, pricing details, and more, with conditional validation for credits, hours, allocation, and max request based on pricing details.
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
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                 description: The ID of the service to update
 *               name:
 *                 type: string
 *                 example: "Web development"
 *                 description: The updated name of the service (optional)
 *               description:
 *                 type: string
 *                 example: "Web development description 3"
 *                 description: The updated description of the service (optional)
 *               price:
 *                 type: string
 *                 example: "1000.00"
 *                 description: The updated price of the service (optional)
 *               credits:
 *                 type: number
 *                 nullable: true
 *                 example: 200
 *                 description: The updated number of credits for the service (required if pricingDetails is 'credits')
 *               hours:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The updated number of hours for the service (required if pricingDetails is 'timebased')
 *               pricingDetails:
 *                 type: string
 *                 example: "standard"
 *                 description: The updated pricing model of the service (e.g., standard, credits, timebased) (optional)
 *               purchaseLimit:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The updated purchase limit for the service (optional)
 *               allocation:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *                 description: The updated allocation type for credits or requests (required if pricingDetails is 'credits' or 'timebased') (optional)
 *               maxRequest:
 *                 type: number
 *                 nullable: true
 *                 example: null
 *                 description: The updated maximum number of requests allowed for the service (required as a number if allocation is 'fixed amount') (optional)
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *                 description: The updated default status of the service (optional)
 *               type:
 *                 type: string
 *                 example: "one off"
 *                 description: The updated type of service (e.g., one off, subscription) (optional)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The updated image file for the service (optional)
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                         example: "bdf8349e-3c76-4c79-95b7-6ef960dd2b36"
 *                       name:
 *                         type: string
 *                         example: "Web development"
 *                       description:
 *                         type: string
 *                         example: "Web development description 3"
 *                       serviceImage:
 *                         type: string
 *                         nullable: true
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/services-image/1745361583838-100minds.jpg"
 *                       price:
 *                         type: string
 *                         example: "1000.00"
 *                       hours:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       credits:
 *                         type: number
 *                         nullable: true
 *                         example: 200
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       type:
 *                         type: string
 *                         example: "one off"
 *                       pricingDetails:
 *                         type: string
 *                         example: "standard"
 *                       purchaseLimit:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       allocation:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       maxRequest:
 *                         type: number
 *                         nullable: true
 *                         example: null
 *                       isDefault:
 *                         type: boolean
 *                         example: false
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
 *                         example: "2025-04-22T22:10:35.077Z"
 *                 message:
 *                   type: string
 *                   example: "Service updated successfully"
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
 *                   example: "Please log in again"
 *                   enum:
 *                     - Please log in again
 *                     - Please provide credits
 *                     - Please provide hours
 *                     - Please provide credits allocation
 *                     - Please provide requests allocation
 *                     - Service default status must be a boolean
 *                     - Service max request must be a number
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
 *                   example: "You are not authorized to update this service"
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
 *         description: Internal Server Error - Service update failed
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
 *                   example: "Service update failed"
 */
router.post('/update', multerUpload.single('serviceImage'), servicesController.updateService);

export { router as serviceRouter };
