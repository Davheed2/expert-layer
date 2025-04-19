import { baseTemplate } from './baseTemplate';

export const forgotPasswordEmail = (data: { name: string; resetLink: string }) => {
	return baseTemplate(
		`<h2>Hello, ${data.name}!</h2>
        <p>
            We received a request to reset your password for your 100minds account.
            Click the button below to set a new password:
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
                                <a href="${data.resetLink}" class="button" style="background-color:rgb(112, 232, 224); border-radius: 20px; color: #163300; display: inline-block; text-decoration: none; padding: 12px 30px; font-size: 16px;">
                                    Reset Password
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
            This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact our support team immediately.
        </p>

        <p>Thanks,<br />The 100minds Team</p>`
	);
};
