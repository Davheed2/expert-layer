export interface CommonDataFields {
	to: string;
	priority: string;
}

export interface SignUpEmailData extends CommonDataFields {
	name: string;
	verificationUrl: string;
}

export interface WelcomeEmailData extends CommonDataFields {
	name: string;
}

export interface LoginEmailData extends CommonDataFields {
	name: string;
	time: string;
}

export interface ForgotPasswordData extends CommonDataFields {
	resetLink: string;
	name: string;
}

export interface ResetPasswordData extends CommonDataFields {
	name: string;
}

export type EmailJobData =
	| { type: 'signUpEmail'; data: SignUpEmailData }
	| { type: 'welcomeEmail'; data: WelcomeEmailData }
	| { type: 'loginEmail'; data: LoginEmailData }
	| { type: 'forgotPassword'; data: ForgotPasswordData }
	| { type: 'resetPassword'; data: ResetPasswordData };
