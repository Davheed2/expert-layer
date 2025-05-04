import { RequestStatus, RequestPriority } from '../constants';

export interface IRequests {
	id: string;
	userId: string;
	status: RequestStatus;
	priority: RequestPriority;
	serviceId: string;
	dueDate: Date;
	credits: number;
	hours: string;
	serviceName: string;
	durationType: string;
	durationAmount: number;
	serviceCategory: string;
	serviceDescription: string;
	servicePrice: number;
	details: string;
	transactionId: string;
	isDeleted: boolean;
	duration: string;
	hasPaid: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface IRequestFiles {
	id: string;
	requestId: string;
	file: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
