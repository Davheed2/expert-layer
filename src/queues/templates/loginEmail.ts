import { baseTemplate } from './baseTemplate';

export const loginEmail = (data: { name: string; time: string }) => {
	return baseTemplate(
		`<h2>Hello, ${data.name}!</h2>

        <p>
            We noticed a new login to your <strong>Expert Layer</strong> account on <strong>${data.time}</strong>.
        </p>

        <p>
            If this was you, no further action is needed. If you don’t recognize this activity, please change your password immediately or reach out to our support team.
        </p>

        <p>
            Your account security is important to us, and we're always here to help.
        </p>

        <p>Thanks,<br />The Expert Layer Team</p>`
	);
};
