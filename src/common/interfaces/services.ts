import { ServiceStatus, ServiceType } from '../constants';

export interface IService {
	id: string;
    userId: string;
	name: string;
	description: string;
	serviceImage: string;
    taskId?: string;
	taskName: string;
	taskTitle: string;
	taskDescription: string;
	taskPrice: number;
	taskDetails: string;
	reference?: string;
	duration: string;
	status: ServiceStatus;
	isActive: boolean;
	type: ServiceType;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
