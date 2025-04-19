import { baseTemplate } from './baseTemplate';

export const loginEmail = (data: { name: string; otp: string }) => {
	return baseTemplate(
		`<h2>Hello, ${data.name}!</h2>
        <p>
            We received a request to log in to your 100minds account. To proceed, please use the One-Time Password (OTP) below:
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
                                <span style="font-size: 22px; font-weight: bold;">
                                    ${data.otp}
                                </span>
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
            This OTP is valid for *5 minutes*. If you did not attempt to log in, please ignore this email or contact our support team immediately.
        </p>

        <p>Thanks,<br />The 100minds Team</p>`
	);
};
