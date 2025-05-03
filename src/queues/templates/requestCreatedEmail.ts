import { baseTemplate } from './baseTemplate';

export const requestCreatedEmail = (data: {
	name: string;
	userName: string;
	serviceName: string;
	serviceCategory: string;
	requestDetails: string;
}) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            A new request has been created in <strong>Expert Layer</strong> and requires your attention.
        </p>

        <p><strong>Request Details:</strong></p>
        <ul>
            <li><strong>Submitted by:</strong> ${data.userName}</li>
            <li><strong>Service Name:</strong> ${data.serviceName}</li>
            <li><strong>Service Category:</strong> ${data.serviceCategory}</li>
            <li><strong>Details:</strong> ${data.requestDetails}</li>
        </ul>

        <p>
            Please review the request in the admin dashboard and take appropriate action.
        </p>

        <p>
            If you have any questions or need assistance, feel free to contact our support team.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
