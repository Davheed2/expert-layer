import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadDocumentFile, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { servicesRepository } from '@/repository';

export class ServicesController {
	createService = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

		const {
			name,
			description,
			taskId,
			taskName,
			taskTitle,
			taskDescription,
			taskPrice,
			taskDetails,
			reference,
			duration,
			type
		} = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!files || !files.serviceImage || !files.serviceImage[0]?.originalname) {
			throw new AppError('service image is required', 400);
		}
		if (!name) {
			throw new AppError('Please provide a service name', 400);
		}
		if (!description) {
			throw new AppError('Please provide a service description', 400);
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
		if (!type) {
			throw new AppError('Please provide a service type', 400);
		}
		if (!files) {
			throw new AppError('Please provide a service image', 400);
		}

		const { secureUrl } = await uploadPictureFile({
			fileName: `services-image/${Date.now()}-${files.serviceImage[0].originalname}`,
			buffer: files.serviceImage[0].buffer,
			mimetype: files.serviceImage[0].mimetype,
		});

		const newService = await servicesRepository.create({
			name,
			description,
			serviceImage: secureUrl,
			taskId,
			taskName,
			taskTitle,
			taskDescription,
			taskPrice,
			taskDetails,
			reference,
			duration,
			userId: user.id,
			type,
		});
		if (!newService) {
			throw new AppError('Service creation failed', 500);
		}

		AppResponse(res, 201, toJSON(newService), 'Service created successfully');

		setImmediate(async () => {
			if (reference) {
				const { secureUrl } = await uploadDocumentFile({
					fileName: `reference/${Date.now()}-${files.reference[0].originalname}`,
					buffer: files.reference[0].buffer,
					mimetype: files.reference[0].mimetype,
				});
				await servicesRepository.update(newService[0].id, { reference: secureUrl });
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
		const { serviceId, isActive } = req.body;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}
		if (!serviceId) {
			throw new AppError('Please provide a service ID', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('You are not authorized to update this service', 401);
		}
		if (typeof isActive !== 'boolean') {
			throw new AppError('Service status must be a boolean', 400);
		}

		const updatedService = await servicesRepository.update(serviceId as string, {
			isActive,
		});
		if (!updatedService) {
			throw new AppError('Service update failed', 500);
		}

		return AppResponse(res, 200, toJSON(updatedService), 'Service updated successfully');
	});
}

export const servicesController = new ServicesController();
