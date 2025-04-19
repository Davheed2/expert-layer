import { baseTemplate } from './baseTemplate';

export const signUpEmail = (data: { name: string; verificationUrl: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>
            Welcome to <strong>Expert Layer</strong> — we’re excited to have you on board!
        </p>

        <p>
            To complete your registration, please verify your email address by clicking the button below:
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
                            <a href="${data.verificationUrl}" style="background-color: #bd531e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                              Verify Email
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
            If the button above doesn’t work, copy and paste the following link into your browser:
        </p>

        <p style="word-break: break-all;">
            <a href="${data.verificationUrl}" style="color: #bd531e;">${data.verificationUrl}</a>
        </p>

        <p>
            This link will expire in <strong>30 days</strong>. If you didn’t sign up for Expert Layer, you can ignore this email.
        </p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
