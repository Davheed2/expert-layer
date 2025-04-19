import { baseTemplate } from './baseTemplate';

export const resetPasswordEmail = (data: { name: string }) => {
	return baseTemplate(
		`<h2>Hello, ${data.name}!</h2>
        <p>
            Your password has been successfully reset. You can now log in with your new password.
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
                                <a href="https://100minds.com/login" class="button" style="background-color: rgb(112, 232, 224); border-radius: 20px; color: #163300; display: inline-block; text-decoration: none; padding: 12px 30px; font-size: 16px;">
                                    Log In
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
            If you did not reset your password, please <a href="https://100minds.com/support" style="color:rgb(112, 232, 204); text-decoration: none;">contact our support team</a> immediately.
        </p>

        <p>Thanks,<br />The 100minds Team</p>`
	);
};
