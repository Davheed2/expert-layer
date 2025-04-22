import { ServicePricing, ServiceRequestAllocation, ServiceStatus, ServiceType } from '../constants';

export interface IService {
	id: string;
	userId: string;
	name: string;
	serviceImage: string;
	description: string;
	price: number;
	credits: number;
	status: ServiceStatus;
	hours: string;
	type: ServiceType;
	pricingDetails: ServicePricing;
	purchaseLimit: string;
	allocation: ServiceRequestAllocation;
	maxRequest: number;
	isDefault: boolean;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
