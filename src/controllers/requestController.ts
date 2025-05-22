import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	deleteObjectFromR2,
	logger,
	referenceGenerator,
	sendExpertAssignedEmail,
	sendExpertJoinEmail,
	sendRequestCreatedEmail,
	toJSON,
	uploadDocumentFile,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import {
	requestsRepository,
	servicesRepository,
	transactionRepository,
	userRepository,
	walletRepository,
} from '@/repository';
import { RequestStatus, ServiceStatus, TransactionStatus, TransactionType } from '@/common/constants';
import { IRequests, IService } from '@/common/interfaces';

export class RequestsController {
	createRequest = catchAsync(async (req: Request, res: Response) => {
		const { user, file } = req;
		const { serviceId, duration, serviceName, serviceCategory, serviceDescription, servicePrice } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!duration) {
			throw new AppError('Please provide a request duration', 400);
		}

		let service: Partial<IService> = {};
		let hours: string | undefined;
		let credits: number | undefined;
		let price: number | undefined;

		if (serviceId) {
			const existingService = await servicesRepository.findById(serviceId);
			if (!existingService || existingService.isDeleted) {
				throw new AppError('Service not found', 404);
			}

			if (existingService.status === ServiceStatus.DRAFT) {
				throw new AppError('Service is not active', 400);
			}

			service = existingService;
			hours = existingService.hours;
			credits = existingService.credits;
			price = existingService.price;
		} else {
			if (!serviceName) {
				throw new AppError('Please provide service name when no service ID is specified', 400);
			}
			if (!serviceCategory) {
				throw new AppError('Please provide service category when no service ID is specified', 400);
			}
			if (!serviceDescription) {
				throw new AppError('Please provide service description when no service ID is specified', 400);
			}
			if (!servicePrice) {
				throw new AppError('Please provide service price when no service ID is specified', 400);
			}
		}

		let walletBalance = await walletRepository.findByUserId(user.id);
		if (!walletBalance || walletBalance.length === 0) {
			walletBalance = await walletRepository.create({
				userId: user.id,
			});
		}

		const cost = Number(price || servicePrice);
		if (isNaN(cost)) {
			throw new AppError('Invalid service price', 400);
		}
		if (walletBalance[0].balance < cost) {
			throw new AppError('Insufficient Balance', 400);
		}

		const transactionId = referenceGenerator();
		const requestPayload = {
			userId: user.id,
			serviceId: service?.id,
			serviceName: service?.name || serviceName,
			serviceCategory: service?.category || serviceCategory,
			serviceDescription: service?.description || serviceDescription,
			servicePrice: price || servicePrice,
			duration,
			transactionId,
			hours,
			credits,
			status: RequestStatus.FINDING_EXPERT,
		};
		const newRequest = await requestsRepository.create(requestPayload);
		if (!newRequest) {
			throw new AppError('Request creation failed', 500);
		}

		await walletRepository.update(walletBalance[0].id, {
			balance: (walletBalance[0].balance -= cost),
		});

		const reference = referenceGenerator();
		await transactionRepository.create({
			userId: user.id,
			amount: cost,
			type: TransactionType.REQUEST,
			status: TransactionStatus.SUCCESS,
			reference,
			description: `$${cost} paid for ${service?.name || serviceName}`,
		});

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
						service?.name || serviceName,
						service?.category || serviceCategory,
						service?.description || serviceDescription
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

		let requests: IRequests[];
		if (user.role === 'admin') {
			requests = await requestsRepository.findAll2();
			if (!requests) {
				throw new AppError('No request found', 404);
			}
		} else {
			requests = await requestsRepository.findByUserId(user.id);
			if (!requests) {
				throw new AppError('No request found', 404);
			}
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
		if (status === 'in_progress') {
			if (user.role !== 'talent') {
				throw new AppError('You are not authorized to update this request to in progress', 401);
			}
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
		if (status === 'blocked') {
			if (existingRequest.status !== 'draft') {
				throw new AppError('You can only cancel a draft request', 400);
			}
		}
		if (status === 'completed') {
			if (user.role !== existingRequest.userId) {
				throw new AppError('You are not authorized to update this request to completed', 401);
			}
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

	addExpertToRequest = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to add an expert to this request', 401);
		}
		if (!requestId) {
			throw new AppError('Request ID is required', 400);
		}
		if (!userId) {
			throw new AppError('Expert ID is required', 400);
		}

		const existingRequest = await requestsRepository.findById(requestId);
		if (!existingRequest) {
			throw new AppError('Request not found', 404);
		}
		const requestOwner = await userRepository.findById(existingRequest.userId);
		if (!requestOwner) {
			throw new AppError('Request owner not found', 404);
		}

		const existingExpert = await userRepository.findById(userId);
		if (!existingExpert) {
			throw new AppError('Expert not found', 404);
		}
		if (existingExpert.role !== 'talent') {
			throw new AppError('User is not an expert', 400);
		}
		if (existingRequest.userId === userId) {
			throw new AppError('You cannot assign the user as their own expert', 400);
		}

		const existingRequestTalent = await requestsRepository.findRequestTalentById(requestId, userId);
		if (existingRequestTalent) {
			throw new AppError('Expert already assigned to this request', 400);
		}

		const requestTalent = await requestsRepository.addExpertToRequest({
			requestId,
			userId,
		});
		if (!requestTalent) {
			throw new AppError('Failed to add expert to request', 500);
		}

		await sendExpertAssignedEmail(requestOwner.email, requestOwner.firstName);
		if (existingExpert.role === 'talent') {
			await sendExpertJoinEmail(existingExpert.email, existingExpert.firstName, existingRequest.serviceName);
		}

		return AppResponse(res, 201, toJSON(requestTalent), 'Expert added to request successfully', req);
	});

	removeExpertFromRequest = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to remove an expert from this request', 401);
		}
		if (!requestId) {
			throw new AppError('Request ID is required', 400);
		}
		if (!userId) {
			throw new AppError('Expert ID is required', 400);
		}

		const existingRequest = await requestsRepository.findById(requestId);
		if (!existingRequest) {
			throw new AppError('Request not found', 404);
		}

		const existingExpert = await userRepository.findById(userId);
		if (!existingExpert) {
			throw new AppError('Expert not found', 404);
		}
		if (existingExpert.role !== 'talent') {
			throw new AppError('User is not an expert', 400);
		}

		const requestTalent = await requestsRepository.removeExpertFromRequest(requestId, userId);
		if (!requestTalent) {
			throw new AppError('Failed to remove expert from request', 500);
		}

		return AppResponse(res, 200, null, 'Expert removed from request successfully', req);
	});

	replaceExpertFromRequest = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { requestId, userId } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to remove an expert from this request', 401);
		}
		if (!requestId) {
			throw new AppError('Request ID is required', 400);
		}
		if (!userId) {
			throw new AppError('Expert ID is required', 400);
		}

		const existingRequest = await requestsRepository.findById(requestId);
		if (!existingRequest) {
			throw new AppError('Request not found', 404);
		}

		const existingExpert = await userRepository.findById(userId);
		if (!existingExpert) {
			throw new AppError('Expert not found', 404);
		}
		if (existingExpert.role !== 'talent') {
			throw new AppError('User is not an expert', 400);
		}

		const existingRequestTalent = await requestsRepository.findRequestTalentById(requestId, userId);
		console.log('existingRequestTalent', existingRequestTalent);
		if (existingRequestTalent) {
			const requestTalent = await requestsRepository.removeExpertFromRequest(
				existingRequestTalent.requestId,
				existingRequestTalent.userId
			);
			if (!requestTalent) {
				throw new AppError('Failed to remove expert from request', 500);
			}
		}

		const requestTalent = await requestsRepository.addExpertToRequest({
			requestId,
			userId,
		});
		if (!requestTalent) {
			throw new AppError('Failed to add expert to request', 500);
		}

		return AppResponse(res, 200, null, 'Expert replaced successfully', req);
	});
}

export const requestsController = new RequestsController();
