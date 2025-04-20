import { Role, ServiceType } from '@/common/constants';
import { z } from 'zod';

const passwordRegexMessage =
	'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character or symbol';

export const mainSchema = z.object({
	firstName: z
		.string()
		.min(2, 'First name must be at least 2 characters long')
		.max(50, 'First name must not be 50 characters long')
		.refine((name) => /^(?!.*-[a-z])[A-Z][a-z'-]*(?:-[A-Z][a-z'-]*)*(?:'[A-Z][a-z'-]*)*$/g.test(name), {
			message:
				'First name must be in sentence case, can include hyphen, and apostrophes (e.g., "Ali", "Ade-Bright" or "Smith\'s").',
		}),
	lastName: z
		.string()
		.min(2, 'Last name must be at least 2 characters long')
		.max(50, 'Last name must not be 50 characters long')
		.refine((name) => /^(?!.*-[a-z])[A-Z][a-z'-]*(?:-[A-Z][a-z'-]*)*(?:'[A-Z][a-z'-]*)*$/g.test(name), {
			message:
				'Last name must be in sentence case, can include hyphen, and apostrophes (e.g., "Ali", "Ade-Bright" or "Smith\'s").',
		}),
	email: z.string().email('Please enter a valid email address!').toLowerCase(),
	password: z
		.string()
		.min(8, 'Password must have at least 8 characters!')
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/, {
			message: passwordRegexMessage,
		}),
	confirmPassword: z
		.string()
		.min(8, 'Confirm Password must have at least 8 characters!')
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/, {
			message: passwordRegexMessage,
		}),
	body: z.string().min(3).trim(),
	token: z.string(),
	receiveCodeViaEmail: z.boolean(),
	name: z.string().min(3).trim(),
	isUserConfigurable: z.boolean(),
	title: z.string().min(3).trim(),
	description: z.string().min(3).trim(),
	popular: z.boolean(),
	role: z.enum([Role.ACCOUNTMANAGER, Role.ADMIN, Role.CLIENT, Role.TALENT]),
	key: z.string(),
	task: z.string().min(3).trim(),
	taskId: z.string().uuid(),
	teamId: z.string().uuid(),
	amount: z.number().positive(),
	duration: z.string(),
	lastWatched: z.string(),
	suspend: z.boolean(),
	enabled: z.boolean(),
	makeAdmin: z.boolean(),
	isActive: z.boolean(),
	userId: z.string().uuid(),
	notificationId: z.string().uuid(),
	serviceId: z.string().uuid(),
	sysNotificationId: z.number(),
	serviceType: z.enum([ServiceType.ONE_TIME, ServiceType.SUBSCRIPTION]),
	// hideMyDetails: z.boolean().default(false),
	message: z.string().min(10),
	oldPassword: z.string().min(8),
	newPassword: z
		.string()
		.min(8, 'Password must have at least 8 characters!')
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/, {
			message: passwordRegexMessage,
		}),
	// redirectUrl: z.string().url(),
});

// Define the partial for partial validation
export const partialMainSchema = mainSchema.partial();
