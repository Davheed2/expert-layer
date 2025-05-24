import { baseTemplate } from './baseTemplate';

export const inviteExistingUserEmail = (data: { name: string; teamOwnerName: string; inviteLink: string }) => {
	return baseTemplate(
		`<h2>Hello, ${data.name}!</h2>
        <p>
            You have been invited to join ${data.teamOwnerName}'s organization on Expert Layer.
            Click the button below to accept the invitation and join the team:
        </p>

        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                 <tr>
                    <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td>
                                <a href="${data.inviteLink}" class="button" style="background-color:rgb(189, 83, 30); border-radius: 20px; color: #bd531e; display: inline-block; text-decoration: none; padding: 12px 30px; font-size: 16px;">
                                    Accept Invitation
                                </a>
                            </td>
                        </tr>
                    </table>
                    </td>
                 </tr>
                </table>
              </td>
            </tr>
        </table>

        <p>
            If you did not expect this invitation, you can safely ignore this email or contact our support team for assistance.
        </p>

        <p>Thanks,<br />The Expert Layer Team</p>`
	);
};
