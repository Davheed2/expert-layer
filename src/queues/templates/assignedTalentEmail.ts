import { baseTemplate } from './baseTemplate';

export const expertAssignedEmail = (data: { name: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Great news! An expert has been assigned to your request on <strong>Expert Layer</strong>.
        </p>

        <p>
            Your expert will reach out soon to assist with your request and answer any questions you may have.
        </p>

        <p>
            If you have any concerns or didn’t expect this, please contact our support team at support@expertlayer.com.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};