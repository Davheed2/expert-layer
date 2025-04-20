export interface ITeam {
	id: string;
	name: string;
	ownerId: string;
	memberId: string;
	memberType: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
