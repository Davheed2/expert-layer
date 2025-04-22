import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	deleteObjectFromR2,
	referenceGenerator,
	toJSON,
	uploadDocumentFile,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { requestsRepository, servicesRepository } from '@/repository';
import { RequestStatus, ServiceStatus } from '@/common/constants';
import { IRequests } from '@/common/interfaces';

export class RequestsController {
	createRequest = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
		const { serviceId, taskName, taskTitle, taskDescription, taskPrice, taskDetails, duration } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!serviceId) {
			throw new AppError('Please provide a service ID', 400);
		}
		if (!taskName) {
			throw new AppError('Please provide a task name', 400);
		}
		if (!taskTitle) {
			throw new AppError('Please provide a task title', 400);
		}
		if (!taskDescription) {
			throw new AppError('Please provide a task description', 400);
		}
		if (!taskPrice) {
			throw new AppError('Please provide a task price', 400);
		}
		if (!taskDetails) {
			throw new AppError('Please provide task details', 400);
		}
		if (!duration) {
			throw new AppError('Please provide a task duration', 400);
		}

		const service = await servicesRepository.findById(serviceId);
		if (!service) {
			throw new AppError('Service not found', 404);
		}
		if (service.isDeleted) {
			throw new AppError('Service not found', 404);
		}
		if (service.status === ServiceStatus.DRAFT) {
			throw new AppError('Service is not active', 400);
		}

		//remember to check for when the service is a recurring service, that need to be checked monthly
		const serviceMaxRequest = service.maxRequest;
		if (serviceMaxRequest !== null && serviceMaxRequest <= 1) {
			const existingRequestNumber = await requestsRepository.findByUserIdAndServiceId(user.id, serviceId);
			if (
				existingRequestNumber[0].status !== RequestStatus.FAILED &&
				existingRequestNumber[0].status !== RequestStatus.PROCESSING
			) {
				if (existingRequestNumber.length >= serviceMaxRequest) {
					throw new AppError('You have reached the maximum number of requests for this service', 400);
				}
			}
		}

		const transactionId = referenceGenerator();
		console.log(transactionId);
		const requestPayload = {
			userId: user.id,
			serviceId,
			taskName,
			taskTitle,
			taskDescription,
			taskPrice,
			taskDetails,
			duration,
			transactionId,
			hours: service.hours,
			credits: service.credits,
			status: RequestStatus.PROCESSING,
		};
		const newRequest = await requestsRepository.create(requestPayload);
		if (!newRequest) {
			throw new AppError('Request creation failed', 500);
		}

		AppResponse(res, 201, null, 'Request created successfully');

		setImmediate(async () => {
			if (files && files.file && files.file.length > 0) {
				const { secureUrl } = await uploadDocumentFile({
					fileName: `requests-file/${Date.now()}-${files.file[0].originalname}`,
					buffer: files.file[0].buffer,
					mimetype: files.file[0].mimetype,
				});
				await requestsRepository.createRequestFile({
					requestId: newRequest[0].id,
					file: secureUrl,
				});
			}
		});
	});

	findByUserId = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const requests = await requestsRepository.findByUserId(user.id);
		if (!requests) {
			throw new AppError('No request found', 404);
		}
		return AppResponse(res, 200, toJSON(requests), 'Requests retrieved successfully');
	});

	findRequestById = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!requestId) {
			throw new AppError('Please provide a request ID', 400);
		}

		const request = await requestsRepository.findById(requestId as string);
		if (!request) {
			throw new AppError('Request not found', 404);
		}
		return AppResponse(res, 200, toJSON([request]), 'Request retrieved successfully');
	});

	updateRequest = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { credits, status, priority, dueDate, requestId } = req.body;
		const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to update this request', 401);
		}
		if (!requestId) {
			throw new AppError('Request ID is required', 400);
		}

		const existingRequest = await requestsRepository.findById(requestId);
		if (!existingRequest) {
			throw new AppError('Request not found', 404);
		}

		const updatePayload: Partial<IRequests> = {};

		if (typeof credits !== 'undefined') {
			if (isNaN(Number(credits))) {
				throw new AppError('Credits must be a number', 400);
			}
			updatePayload.credits = Number(credits);
		}

		if (typeof status !== 'undefined') {
			updatePayload.status = status;
		}

		if (typeof priority !== 'undefined') {
			updatePayload.priority = priority;
		}

		if (typeof dueDate !== 'undefined') {
			const parsedDate = new Date(dueDate);
			if (isNaN(parsedDate.getTime())) {
				throw new AppError('Invalid due date format', 400);
			}
			updatePayload.dueDate = parsedDate;
		}

		if (files && files.file && files.file.length > 0) {
			const { secureUrl } = await uploadDocumentFile({
				fileName: `requests-file/${Date.now()}-${files.file[0].originalname}`,
				buffer: files.file[0].buffer,
				mimetype: files.file[0].mimetype,
			});
			await requestsRepository.createRequestFile({
				requestId: requestId,
				file: secureUrl,
			});
		}

		const updatedRequest = await requestsRepository.update(requestId, updatePayload);
		if (!updatedRequest) {
			throw new AppError('Request update failed', 500);
		}

		return AppResponse(res, 200, null, 'Request updated successfully');
	});

	deleteRequestFile = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestFileId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to delete this request file', 401);
		}
		if (!requestFileId) {
			throw new AppError('Request file ID is required', 400);
		}

		const existingRequestFile = await requestsRepository.findByRequestFileId(requestFileId);
		if (!existingRequestFile) {
			throw new AppError('Request file not found', 404);
		}

		const deleteResult = await deleteObjectFromR2(existingRequestFile.file);
		if (deleteResult === false) {
			throw new AppError('Failed to delete the existing document.');
		}

		const deleteRequestFile = await requestsRepository.deleteRequestFile(requestFileId);
		if (!deleteRequestFile) {
			throw new AppError('Request file deletion failed', 500);
		}

		return AppResponse(res, 200, null, 'Request file deleted successfully');
	});
}

export const requestsController = new RequestsController();
