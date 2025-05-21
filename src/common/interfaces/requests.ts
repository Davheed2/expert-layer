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

export interface IRequestTalents {
	id: string;
	requestId: string;
	userId: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}

// export interface IRequests2 {
// 	id: string;
// 	userId: string;
// 	title: string;
// 	description: string;
// 	status: RequestStatus;
// 	serviceCategory: ServiceCategory;
// 	//ask for time frame
// 	//should you send only the priorities then i will parse in the days in the db instead of calling timeFrame type tohgetther with the timeFrame?
// 	timeFrame: string; // Maps to Timeframe (Standard, Express, Urgent)
// 	timeFrameType: string;
// 	budget: number; // Maps to Budget Range (50-100, 100-200, 200+)
// 	expertPreference: string;
// 	estimatedCost: number; // Maps to Estimated Cost
// 	isDeleted: boolean;
// 	hasPaid: boolean;
// 	created_at?: Date;
// 	updated_at?: Date;

// 	//should you send only the priorities then i will parse in the days in the db instead of calling timeFrame type tohgetther with the timeFrame?
// 	priority: RequestPriority;
// 	transactionId: string;

// }
