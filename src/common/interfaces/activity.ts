export interface IActivity {
	id: string;
	userId: string;
	requestId: string;
	activity: string;
    activityDescription: string;
    isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
