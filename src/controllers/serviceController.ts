import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { servicesRepository } from '@/repository';
import { IService } from '@/common/interfaces';

export class ServicesController {
	createService = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { file } = req;

		const {
			name,
			description,
			price,
			credits,
			hours,
			pricingDetails,
			purchaseLimit,
			allocation,
			maxRequest,
			isDefault,
			type,
		} = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to create a service', 401);
		}
		if (!name) {
			throw new AppError('Please provide a service name', 400);
		}
		if (!description) {
			throw new AppError('Please provide a service description', 400);
		}
		if (!type) {
			throw new AppError('Please provide a service type', 400);
		}
		if (!price) {
			throw new AppError('Please provide a service price', 400);
		}
		if (!pricingDetails) {
			throw new AppError('Please provide service pricing details', 400);
		}
		if (pricingDetails) {
			if (pricingDetails === 'credits' && !credits) {
				throw new AppError('Please provide credits', 400);
			}
			if (pricingDetails === 'timebased' && !hours) {
				throw new AppError('Please provide hours', 400);
			}
			if (pricingDetails === 'credits' && !allocation) {
				throw new AppError('Please provide credits allocation', 400);
			}
			if (pricingDetails === 'timebased' && !allocation) {
				throw new AppError('Please provide requests allocation', 400);
			}
		}
		if (typeof isDefault !== 'boolean') {
			throw new AppError('Service default status must be a boolean', 400);
		}
		if (allocation === 'fixed amount' && typeof maxRequest !== 'number') {
			throw new AppError('Service max request must be a number', 400);
		}

		const newService = await servicesRepository.create({
			name,
			description,
			price,
			credits,
			hours,
			pricingDetails,
			purchaseLimit,
			allocation,
			maxRequest,
			isDefault,
			type,
			userId: user.id,
		});
		if (!newService) {
			throw new AppError('Service creation failed', 500);
		}

		AppResponse(res, 201, newService, 'Service created successfully');

		setImmediate(async () => {
			if (file) {
				const { secureUrl } = await uploadPictureFile({
					fileName: `services-image/${Date.now()}-${file.originalname}`,
					buffer: file.buffer,
					mimetype: file.mimetype,
				});
				await servicesRepository.update(newService[0].id, { serviceImage: secureUrl });
			}
		});
	});

	findAllServices = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to view all services', 401);
		}

		const services = await servicesRepository.findAll();
		if (!services) {
			throw new AppError('No services found', 404);
		}

		return AppResponse(res, 200, toJSON(services), 'Services retrieved successfully');
	});

	findClientServices = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const services = await servicesRepository.findAllActive();
		if (!services) {
			throw new AppError('No services found', 404);
		}

		return AppResponse(res, 200, toJSON(services), 'Services retrieved successfully');
	});

	findServiceById = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { serviceId } = req.query;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!serviceId) {
			throw new AppError('Please provide a service ID', 400);
		}

		const service = await servicesRepository.findById(serviceId as string);
		if (!service) {
			throw new AppError('Service not found', 404);
		}
		return AppResponse(res, 200, toJSON([service]), 'Service retrieved successfully');
	});

	updateService = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { file } = req;
		const {
			name,
			description,
			price,
			credits,
			hours,
			pricingDetails,
			purchaseLimit,
			allocation,
			maxRequest,
			isDefault,
			type,
			serviceId,
		} = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to update this service', 401);
		}

		const existingService = await servicesRepository.findById(serviceId);
		if (!existingService) {
			throw new AppError('Service not found', 404);
		}

		const updatePayload: Partial<IService> = {};

		if (name) updatePayload.name = name;
		if (description) updatePayload.description = description;
		if (type) updatePayload.type = type;
		if (price) updatePayload.price = price;
		if (pricingDetails) {
			updatePayload.pricingDetails = pricingDetails;

			if (pricingDetails === 'credits') {
				if (!credits) throw new AppError('Please provide credits', 400);
				if (!allocation) throw new AppError('Please provide credits allocation', 400);
				updatePayload.credits = credits;
				updatePayload.allocation = allocation;
			}

			if (pricingDetails === 'timebased') {
				if (!hours) throw new AppError('Please provide hours', 400);
				if (!allocation) throw new AppError('Please provide requests allocation', 400);
				updatePayload.hours = hours;
				updatePayload.allocation = allocation;
			}
		}

		if (typeof isDefault !== 'undefined') {
			if (typeof isDefault !== 'boolean') {
				throw new AppError('Service default status must be a boolean', 400);
			}
			updatePayload.isDefault = isDefault;
		}

		if (purchaseLimit) updatePayload.purchaseLimit = purchaseLimit;

		if (allocation === 'fixed amount') {
			if (typeof maxRequest !== 'number') {
				throw new AppError('Service max request must be a number', 400);
			}
			updatePayload.maxRequest = maxRequest;
		} else if (maxRequest) {
			updatePayload.maxRequest = maxRequest;
		}

		if (file) {
			const { secureUrl } = await uploadPictureFile({
				fileName: `services-image/${Date.now()}-${file.originalname}`,
				buffer: file.buffer,
				mimetype: file.mimetype,
			});
			updatePayload.serviceImage = secureUrl;
		}

		const updatedService = await servicesRepository.update(serviceId, updatePayload);
		if (!updatedService) {
			throw new AppError('Service update failed', 500);
		}

		return AppResponse(res, 200, toJSON(updatedService), 'Service updated successfully');
	});
}

export const servicesController = new ServicesController();
