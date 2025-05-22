
export interface IComment {
	id: string;
	userId: string;
	requestId: string;
	comment: string;
	created_at?: Date;
	updated_at?: Date;
}