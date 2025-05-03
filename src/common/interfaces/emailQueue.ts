export interface CommonDataFields {
	to: string;
	priority: string;
}

export interface SignUpEmailData extends CommonDataFields {
	name: string;
	otp: string;
}

export interface WelcomeEmailData extends CommonDataFields {
	name: string;
}

export interface LoginEmailData extends CommonDataFields {
	name: string;
	time: string;
}

export interface MagicEmailData extends CommonDataFields {
	name: string;
	otp: string;
}

export interface ForgotPasswordData extends CommonDataFields {
	resetLink: string;
	name: string;
}

export interface ResetPasswordData extends CommonDataFields {
	name: string;
}

export interface JoinTeamData extends CommonDataFields {
	name: string;
	teamName: string;
}

export interface RequestData extends CommonDataFields {
	name: string;
	userName: string;
	serviceName: string;
	serviceCategory: string;
	requestDetails: string;
}

export type EmailJobData =
	| { type: 'signUpEmail'; data: SignUpEmailData }
	| { type: 'welcomeEmail'; data: WelcomeEmailData }
	| { type: 'loginEmail'; data: LoginEmailData }
	| { type: 'magicEmail'; data: MagicEmailData }
	| { type: 'forgotPassword'; data: ForgotPasswordData }
	| { type: 'resetPassword'; data: ResetPasswordData }
	| { type: 'joinTeam'; data: JoinTeamData }
	| { type: 'requestCreated'; data: RequestData };
