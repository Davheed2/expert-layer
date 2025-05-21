import { baseTemplate } from './baseTemplate';

export const expertJoinEmail = (data: { name: string; requestName: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Welcome to the <strong>${data.requestName}</strong> request — we’re thrilled to have you on board!
        </p>

        <p>
            You’ve been added as an expert for the request. You can now collaborate with others and contribute to fulfilling this request.
        </p>

        <p>
            If you believe this is an error or you didn’t expect to be added to this request, please contact our support team at support@expertlayer.com.
        </p>

        <p>Thanks,<br/>The Expert Layer Crew</p>`
	);
};
