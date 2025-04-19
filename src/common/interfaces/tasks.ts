export interface ITasks {
	id: string;
	task: string;
	taskImage: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface ITaskDetails {
	id: string;
	taskId: string;
	title: string;
	description: string;
	amount: number;
	popular: boolean;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface ITaskWithDetails extends ITasks {
	details: ITaskDetails[];
}
