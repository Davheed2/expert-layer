import { baseTemplate } from './baseTemplate';

export const magicLinkEmail = (data: { name: string; magicLink: string }) => {
	return baseTemplate(
		`<h2>Hi ${data.name},</h2>

        <p>Click the button below to log in to <strong>Expert Layer</strong>:</p>

        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <a href="${data.magicLink}" style="background-color: #bd531e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
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

        <p>If the button doesn't work, use this link:</p>

        <p style="word-break: break-all;">
            <a href="${data.magicLink}" style="color: #bd531e;">${data.magicLink}</a>
        </p>

        <p>This link will expire in <strong>15 minutes</strong>.</p>

        <p>Thanks,<br/>The Expert Layer Team</p>`
	);
};
