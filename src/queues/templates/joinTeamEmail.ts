import { baseTemplate } from './baseTemplate';

export const teamJoinEmail = (data: { name: string; teamName: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Welcome to the <strong>${data.teamName}</strong> project — we’re thrilled to have you on board!
        </p>

        <p>
            You’ve been added as a member of the project. You can now collaborate with the team and contribute to our goals.
        </p>

        <p>
            If you believe this is an error or you didn’t expect to be added to this project, please contact our support team.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
