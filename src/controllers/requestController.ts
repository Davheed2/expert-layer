import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	deleteObjectFromR2,
	logger,
	referenceGenerator,
	sendRequestCreatedEmail,
	toJSON,
	uploadDocumentFile,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { requestsRepository, servicesRepository, userRepository } from '@/repository';
import { RequestStatus, ServiceStatus } from '@/common/constants';
import { IRequests } from '@/common/interfaces';

export class RequestsController {
	createRequest = catchAsync(async (req: Request, res: Response) => {
		const { user, file } = req;
		const { serviceId, details, duration, durationType } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!serviceId) {
			throw new AppError('Please provide a service ID', 400);
		}
		if (!details) {
			throw new AppError('Please provide request details', 400);
		}
		if (!duration) {
			throw new AppError('Please provide a request duration', 400);
		}
		if (!durationType) {
			throw new AppError('Please provide a request duration type', 400);
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
			if (existingRequestNumber.length >= serviceMaxRequest) {
				if (existingRequestNumber[0].status !== RequestStatus.BLOCKED) {
					throw new AppError('You have reached the maximum number of requests for this service', 400);
				}
			}
		}

		let durationAmount: number = 0;
		if (durationType === 'standard') {
			durationAmount = 0;
		} else if (durationType === 'custom') {
			durationAmount = 0;
		} else if (durationType === 'priority') {
			durationAmount = 49;
		} else if (durationType === 'express') {
			durationAmount = 99;
		}

		const transactionId = referenceGenerator();
		const requestPayload = {
			userId: user.id,
			serviceId: service.id,
			serviceName: service.name,
			serviceCategory: service.category,
			serviceDescription: service.description,
			servicePrice: service.price,
			details,
			duration,
			transactionId,
			hours: service.hours,
			credits: service.credits,
			status: RequestStatus.DRAFT,
			durationType,
			durationAmount,
		};
		const newRequest = await requestsRepository.create(requestPayload);
		if (!newRequest) {
			throw new AppError('Request creation failed', 500);
		}

		AppResponse(res, 201, toJSON(newRequest), 'Request created successfully', req);

		setImmediate(async () => {
			try {
				if (file?.buffer && file?.originalname && file?.mimetype) {
					const { secureUrl } = await uploadDocumentFile({
						fileName: `requests-file/${Date.now()}-${file.originalname}`,
						buffer: file.buffer,
						mimetype: file.mimetype,
					});
					await requestsRepository.createRequestFile({
						requestId: newRequest[0].id,
						file: secureUrl,
					});
				}

				const admins = await userRepository.findAllAdmins();
				for (const admin of admins) {
					await sendRequestCreatedEmail(
						admin.email,
						admin.firstName,
						`${user.firstName} ${user.lastName}`,
						service.name,
						service.category,
						details
					);
				}
			} catch (err) {
				logger.error('Error during background file upload for request or admin emails', err);
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

		return AppResponse(res, 200, toJSON(requests), 'Requests retrieved successfully', req);
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

		const request = await requestsRepository.findRequestById(requestId as string);
		if (!request) {
			throw new AppError('Request not found', 404);
		}

		return AppResponse(res, 200, toJSON(request), 'Request retrieved successfully', req);
	});

	updateRequest = catchAsync(async (req: Request, res: Response) => {
		const { user, file } = req;
		const { credits, status, priority, dueDate, requestId } = req.body;

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

		if (file) {
			const { secureUrl } = await uploadDocumentFile({
				fileName: `requests-file/${Date.now()}-${file.originalname}`,
				buffer: file.buffer,
				mimetype: file.mimetype,
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

		return AppResponse(res, 200, toJSON(updatedRequest), 'Request updated successfully', req);
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

		return AppResponse(res, 200, null, 'Request file deleted successfully', req);
	});
}

export const requestsController = new RequestsController();
