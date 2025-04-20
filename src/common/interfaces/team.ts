export interface ITeam {
	id: string;
	name: string;
	ownerId: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface ITeamWithOwner extends ITeam {
	firstName: string;
	lastName: string;
	photo: string;
}

export interface ITeamMember {
	id: string;
	teamId: string;
	ownerId: string;
	memberId: string;
	memberType: string;
	isDeleted: boolean;
	created_at?: Date;
	updated_at?: Date;
}
