export const baseTemplate = (template: string): string => {
	return `<!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>expert layer</title>
      <style type="text/css" rel="stylesheet" media="all">
        /* Base Styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          width: 100% !important;
          height: 100%;
          margin: 0;
          font-family: 'Inter', Helvetica, Arial, sans-serif;
          background-color: #F2F4F6;
          color: #51545E;
        }
        a {
          color: rgb(189, 83, 30);
          text-decoration: none;
        }
        /* Email Container */
        .email-wrapper {
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: #F2F4F6;
        }
        .email-content {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        /* Masthead */
        .email-masthead {
          padding: 25px 0 10px;
          text-align: center;
          background-color: #fff;
        }
        /* Email Body */
        .email-body {
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .email-body_inner {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          background-color: #fff;
          border-radius: 5px;
        }
        .content-cell {
          padding: 45px 40px;
        }
        .content-cell-footer {
          padding: 30px 40px;
        }
        /* Footer */
        .email-footer {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          text-align: center;
          background-color: rgba(44, 44, 44, 0.03);
        }
        .email-footer p {
          color: #51545E;
          font-size: 11px;
          margin: 5px 0;
        }
        /* Buttons */
        .button {
          background-color: #bd531e;
          border-radius: 20px;
          color: #163300;
          display: block;
          text-decoration: none;
          padding: 1.5rem 6rem;
          width: 100%;
          box-sizing: border-box;
          text-align: center;
          margin: 20px auto;
          max-width: 600px;
          font-weight: bold;
        }
        .button--orange {
          background-color: #bd531e;
        }
        .button--red {
          background-color: #FF6136;
        }
        /* Media Queries */
        @media only screen and (max-width: 600px) {
          .email-body_inner,
          .email-footer {
            width: 100% !important;
          }
          .button {
            padding: 1rem 5rem;
            white-space: normal;
            word-wrap: break-word;
          }
        }
      </style>
    </head>
  
    <body>
      <table class="email-wrapper" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <table class="email-content" cellpadding="0" cellspacing="0">
              <tr>
               <td class="email-masthead">
                <h1 style="
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                  color: #bd531e;
                  font-family: 'Inter', Helvetica, Arial, sans-serif;
                  text-align: center;
                  letter-spacing: 1px;
                ">
                  Expert Layer
                </h1>
              </td>
         
              </tr>
  
              <!-- Email Body -->
              <tr>
                <td class="email-body">
                  <table class="email-body_inner" align="center" cellpadding="0" cellspacing="0">
                    <!-- Body content -->
                    <tr>
                      <td class="content-cell">
                        ${template}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td>
                  <table class="email-footer" align="center" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="content-cell-footer">
                        <p>
                          This email was sent to you by Expert layer. By using our services, you agree to our
                        </p>
                        <p>
                          <a href="https://helpcenter.com">customer agreements</a>.
                        </p>
                        <p>&copy; expertlayer ${new Date().getFullYear()}. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
};

//           <p style="color: #F2F4F6; line-height: 1.5; font-size: 14px; margin: 0; font-weight: 500;">
//   Want to change what we get in touch about? Go to your
//   <a href="https://vigoplace.com" style="color: #9FE870; text-decoration: underline; font-size: 12px;">Notification Settings</a>.
//   We can't receive replies to this email address. But if you'd like some support, please visit our
// </p>
// <p style="text-align: center; margin: 0 auto 10px auto; font-size: 12px; font-weight: 500;">
//   <a href="https://helpcenter.com" style="color: #9FE870; text-decoration: underline; display: inline-block;">Help Center</a>
// </p>
