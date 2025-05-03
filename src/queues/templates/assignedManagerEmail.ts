import { baseTemplate } from './baseTemplate';

export const accountManagerAssignedEmail = (data: { name: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Great news! An account manager has been assigned to your account on <strong>Expert Layer</strong>.
        </p>

        <p>
            Your account manager will reach out soon to assist with your project and answer any questions you may have.
        </p>

        <p>
            If you have any concerns or didn’t expect this, please contact our support team at support@expertlayer.com.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
