// Escape values interpolated into email HTML to prevent HTML/attribute
// injection (defense-in-depth; `url` is auth-generated but `userName` is
// user-supplied).
function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type VerificationTemplateProps = {
  url: string;
};

type ResetPasswordTemplateProps = {
  url: string;
  userName: string;
};

type WelcomeTemplateProps = {
  userName: string;
};

export function verificationEmailTemplate({ url }: VerificationTemplateProps) {
  const safeUrl = escapeHtml(url);
  return {
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,

    html: `
      <div style="background-color: #ffffff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace;">
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #000000; padding: 40px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="color: #000000; font-size: 18px; font-weight: 400; letter-spacing: 2px;">PREPLIT</span>
          </div>
          
          <h1 style="margin: 0 0 30px 0; color: #000000; font-size: 20px; font-weight: 400; text-align: center; letter-spacing: 1px;">
            VERIFY EMAIL
          </h1>
          
          <div style="border-top: 1px solid #000000; margin-bottom: 30px;"></div>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
            Click the link below to verify your email address.
          </p>
          
          <div style="margin: 30px 0;">
            <a href="${safeUrl}"
               style="
                 display: block;
                 padding: 12px 20px;
                 background-color: #000000;
                 color: #ffffff;
                 text-decoration: none;
                 text-align: center;
                 font-size: 12px;
                 letter-spacing: 1px;
               ">
              VERIFY EMAIL
            </a>
          </div>

          <div style="border-top: 1px solid #000000; margin: 30px 0;"></div>

          <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 0;">
            If you did not create this account, ignore this email.
          </p>

          <p style="color: #999999; font-size: 11px; line-height: 1.6; margin: 20px 0 0 0; word-break: break-all;">
            ${safeUrl}
          </p>
          
        </div>
      </div>
    `,
  };
}

export function resetPasswordEmailTemplate({
  url,
  userName,
}: ResetPasswordTemplateProps) {
  const safeUrl = escapeHtml(url);
  const safeName = escapeHtml(userName);
  return {
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,

    html: `
      <div style="background-color: #ffffff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace;">
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #000000; padding: 40px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="color: #000000; font-size: 18px; font-weight: 400; letter-spacing: 2px;">PREPLIT</span>
          </div>
          
          <h1 style="margin: 0 0 30px 0; color: #000000; font-size: 20px; font-weight: 400; text-align: center; letter-spacing: 1px;">
            PASSWORD RESET
          </h1>
          
          <div style="border-top: 1px solid #000000; margin-bottom: 30px;"></div>
          
          ${
            userName
              ? `<p style="color: #000000; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">${safeName},</p>`
              : ""
          }
          
          <p style="color: #000000; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
            A password reset was requested for your account.
          </p>
          
          <div style="margin: 30px 0;">
            <a href="${safeUrl}"
               style="
                 display: block;
                 padding: 12px 20px;
                 background-color: #000000;
                 color: #ffffff;
                 text-decoration: none;
                 text-align: center;
                 font-size: 12px;
                 letter-spacing: 1px;
               ">
              RESET PASSWORD
            </a>
          </div>
          
          <div style="border: 1px solid #000000; padding: 15px; margin: 30px 0;">
            <p style="color: #000000; font-size: 12px; line-height: 1.6; margin: 0;">
              This link expires in 1 hour. If you did not request this, ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #000000; margin: 30px 0;"></div>
          
          <p style="color: #999999; font-size: 11px; line-height: 1.6; margin: 0; word-break: break-all;">
            ${safeUrl}
          </p>
          
        </div>
      </div>
    `,
  };
}

export function welcomeEmailTemplate({ userName }: WelcomeTemplateProps) {
  const safeName = escapeHtml(userName);
  return {
    subject: "Welcome to Preplit",
    text: `${userName}, welcome to Preplit.`,

    html: `
      <div style="background-color: #ffffff; padding: 60px 20px; font-family: 'Courier New', Courier, monospace;">
        <div style="max-width: 500px; margin: 0 auto; border: 1px solid #000000; padding: 40px;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <span style="color: #000000; font-size: 18px; font-weight: 400; letter-spacing: 2px;">PREPLIT</span>
          </div>
          
          <h1 style="margin: 0 0 30px 0; color: #000000; font-size: 20px; font-weight: 400; text-align: center; letter-spacing: 1px;">
            WELCOME
          </h1>
          
          <div style="border-top: 1px solid #000000; margin-bottom: 30px;"></div>
          
          <p style="color: #000000; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
            ${safeName},
          </p>

          <p style="color: #000000; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
            Your account has been verified. You can now access all features.
          </p>
          
          <div style="border-top: 1px solid #000000; margin: 30px 0;"></div>
          
          <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 0;">
            If you have questions, contact support.
          </p>
          
        </div>
      </div>
    `,
  };
}
