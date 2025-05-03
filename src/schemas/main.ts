import {
	RequestPriority,
	Role,
	ServiceCategory,
	ServicePricing,
	ServiceRequestAllocation,
	ServiceStatus,
	ServiceType,
} from '@/common/constants';
import { z } from 'zod';

const passwordRegexMessage =
	'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character or symbol';

export const mainSchema = z.object({
	firstName: z
		.string()
		.min(2, 'First name must be at least 2 characters long')
		.max(50, 'First name must not be 50 characters long'),
	lastName: z
		.string()
		.min(2, 'Last name must be at least 2 characters long')
		.max(50, 'Last name must not be 50 characters long'),
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
	price: z.number().positive(),
	credits: z.number().positive(),
	hours: z.string().min(3).trim(),
	pricingDetails: z.enum([ServicePricing.STANDARD, ServicePricing.TIMEBASED, ServicePricing.CREDITS]),
	purchaseLimit: z.string().min(3).trim(),
	allocation: z.enum([ServiceRequestAllocation.FIXEDAMOUNT, ServiceRequestAllocation.TOTALCREDITS]),
	maxRequest: z.number().positive(),
	isDefault: z.string(),
	serviceImage: z.string(),
	type: z.enum([ServiceType.ONE_OFF, ServiceType.RECURRING]),
	serviceName: z.string().min(3).trim(),
	serviceCategory: z.string().min(3).trim(),
	serviceDescription: z.string().min(3).trim(),
	servicePrice: z.number().positive(),
	otp: z.string().min(3).trim(),
	details: z.string().min(3).trim(),
	duration: z.string().min(3).trim(),
	verificationToken: z.string().min(5).max(6),
	isUserConfigurable: z.boolean(),
	title: z.string().min(3).trim(),
	description: z.string().min(3).trim(),
	popular: z.boolean(),
	requestFileId: z.string().uuid(),
	role: z.enum([Role.ACCOUNTMANAGER, Role.ADMIN, Role.CLIENT, Role.TALENT]),
	key: z.string(),
	category: z.enum([
		ServiceCategory.CONTENT,
		ServiceCategory.DESIGN,
		ServiceCategory.DEVELOPMENT,
		ServiceCategory.GROWTH,
	]),
	status: z.enum([
		ServiceStatus.ACTIVE,
		ServiceStatus.DRAFT
	]),
	priority: z.enum([RequestPriority.LOW, RequestPriority.MEDIUM, RequestPriority.HIGH, RequestPriority.NONE]),
	dueDate: z.string().datetime(),
	requestId: z.string().uuid(),
	task: z.string().min(3).trim(),
	taskId: z.string().uuid(),
	teamId: z.string().uuid(),
	amount: z.number().positive(),
	suspend: z.boolean(),
	enabled: z.boolean(),
	makeAdmin: z.boolean(),
	isActive: z.boolean(),
	userId: z.string().uuid(),
	notificationId: z.string().uuid(),
	serviceId: z.string().uuid(),
	sysNotificationId: z.number(),
	serviceType: z.enum([ServiceType.ONE_OFF, ServiceType.RECURRING]),
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
