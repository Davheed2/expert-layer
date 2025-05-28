import {
	EmailJobData,
	LoginEmailData,
	ResetPasswordData,
	ForgotPasswordData,
	WelcomeEmailData,
	SignUpEmailData,
	MagicEmailData,
	JoinTeamData,
	RequestData,
	AssignedManagerData,
	RequestJoinData,
	AssignedExpertData,
	InviteNonExistingUserData,
	InviteExistingUserData,
	NewCommentData,
} from '@/common/interfaces';
import { logger } from '@/common/utils';
import nodemailer from 'nodemailer';
import { ENVIRONMENT } from 'src/common/config';
import {
	forgotPasswordEmail,
	loginEmail,
	magicLinkEmail,
	resetPasswordEmail,
	signUpEmail,
	welcomeEmail,
	teamJoinEmail,
	requestCreatedEmail,
	accountManagerAssignedEmail,
	expertJoinEmail,
	expertAssignedEmail,
	inviteNonExistingUserEmail,
	inviteExistingUserEmail,
	newCommentEmail,
} from '../templates';

const transporter = nodemailer.createTransport({
	//service: 'gmail',
	host: 'smtp.zeptomail.com',
	port: 587,
	secure: false,
	auth: {
		user: ENVIRONMENT.EMAIL.GMAIL_USER,
		pass: ENVIRONMENT.EMAIL.GMAIL_PASSWORD,
	},
});

export const sendEmail = async (job: EmailJobData) => {
	const { data, type } = job as EmailJobData;

	let htmlContent: string;
	let subject: string;

	switch (type) {
		case 'signUpEmail':
			htmlContent = signUpEmail(data as SignUpEmailData);
			subject = 'Verify your email to get started with Expert Layer';
			break;
		case 'welcomeEmail':
			htmlContent = welcomeEmail(data as WelcomeEmailData);
			subject = 'Welcome to Expert Layer';
			break;
		case 'magicEmail':
			htmlContent = magicLinkEmail(data as MagicEmailData);
			subject = 'Verify your email to continue with Expert Layer';
			break;
		case 'loginEmail':
			htmlContent = loginEmail(data as LoginEmailData);
			subject = 'Login Alert';
			break;
		case 'forgotPassword':
			htmlContent = forgotPasswordEmail(data as ForgotPasswordData);
			subject = 'Forgot Password';
			break;
		case 'resetPassword':
			htmlContent = resetPasswordEmail(data as ResetPasswordData);
			subject = 'Reset Password';
			break;
		case 'joinTeam':
			htmlContent = teamJoinEmail(data as JoinTeamData);
			subject = 'You have been assigned to a project';
			break;
		case 'requestCreated':
			htmlContent = requestCreatedEmail(data as RequestData);
			subject = 'A new request has been created';
			break;
		case 'assignedManager':
			htmlContent = accountManagerAssignedEmail(data as AssignedManagerData);
			subject = 'An account manager has been assigned to your project';
			break;
		case 'assignedTalent':
			htmlContent = expertAssignedEmail(data as AssignedExpertData);
			subject = 'An expert has been assigned to your project';
			break;
		case 'joinRequest':
			htmlContent = expertJoinEmail(data as RequestJoinData);
			subject = 'You have been assigned to a request';
			break;
		case 'inviteNonExistingUser':
			htmlContent = inviteNonExistingUserEmail(data as InviteNonExistingUserData);
			subject = 'You have been invited to join an organization';
			break;
		case 'inviteExistingUser':
			htmlContent = inviteExistingUserEmail(data as InviteExistingUserData);
			subject = 'You have been invited to join an organization';
			break;
		case 'newComment':
			htmlContent = newCommentEmail(data as NewCommentData);
			subject = 'New comment added to request';
			break;
		// Handle other email types...
		default:
			throw new Error(`No template found for email type: ${type}`);
	}

	const mailOptions = {
		from: `"Expert Layer" <support@expertlayer.co`,
		to: data.to,
		subject: subject,
		html: htmlContent,
	};

	try {
		const dispatch = await transporter.sendMail(mailOptions);
		console.log(dispatch);
		logger.info(`Email successfully sent to ${data.to}`);
	} catch (error) {
		console.error(error);
		logger.error(`Failed to send email to ${data.to}: ${error}`);
	}
};
