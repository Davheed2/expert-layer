import { baseTemplate } from './baseTemplate';

export const newCommentEmail = (data: {
	recipientName: string;
	commenterFirstName: string;
	commenterLastName: string;
	requestName: string;
	requestLink: string;
}) => {
	return baseTemplate(
		`<h2>Hello, ${data.recipientName}!</h2>
        <p>
            A new comment has been added to ${data.requestName} request by ${data.commenterFirstName} ${data.commenterLastName}.
            Click the button below to view the request and the new comment:
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
                                <a href="${data.requestLink}" class="button" style="background-color:rgb(189, 83, 30); border-radius: 20px; color: #bd531e; display: inline-block; text-decoration: none; padding: 12px 30px; font-size: 16px; color: #ffffff;">
                                    View Request
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
            If you have any questions or did not expect this notification, please contact our support team.
        </p>

        <p>Thanks,<br />The Expert Layer Team</p>`
	);
};
