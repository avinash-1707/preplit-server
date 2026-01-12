type VerificationTemplateProps = {
  url: string;
};

type ResetPasswordTemplateProps = {
  url: string;
  userName: string;
};

export function verificationEmailTemplate({ url }: VerificationTemplateProps) {
  return {
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,

    html: `
      <div style="background-color: #0a0a0a; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #151515 100%); border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px; text-align: center;">
            <div style="margin-bottom: 12px;">
              <span style="color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -1px;">Preplit</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
              Verify Your Email
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px;">
            <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Thanks for signing up! We're excited to have you on board.
            </p>
            
            <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
              Click the button below to verify your email address and get started:
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" 
                 style="
                   display: inline-block;
                   padding: 14px 32px;
                   background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                   color: #ffffff;
                   text-decoration: none;
                   border-radius: 8px;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                   transition: all 0.3s ease;
                 ">
                Verify Email Address
              </a>
            </div>
            
            <!-- Divider -->
            <div style="border-top: 1px solid #2a2a2a; margin: 32px 0;"></div>
            
            <!-- Footer note -->
            <p style="color: #737373; font-size: 14px; line-height: 1.5; margin: 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
            
            <!-- Link fallback -->
            <p style="color: #525252; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
              Or copy and paste this link into your browser:<br/>
              <span style="color: #2563eb; word-break: break-all;">${url}</span>
            </p>
          </div>
          
        </div>
      </div>
    `,
  };
}

export function resetPasswordEmailTemplate({
  url,
  userName,
}: ResetPasswordTemplateProps) {
  return {
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,

    html: `
      <div style="background-color: #0a0a0a; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #151515 100%); border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 40px; text-align: center;">
            <div style="margin-bottom: 12px;">
              <span style="color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -1px;">Preplit</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
              Reset Your Password
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px;">
            ${
              userName
                ? `<p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>`
                : ""
            }
            
            <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              We received a request to reset your password.
            </p>
            
            <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
              Click the button below to create a new password:
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" 
                 style="
                   display: inline-block;
                   padding: 14px 32px;
                   background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                   color: #ffffff;
                   text-decoration: none;
                   border-radius: 8px;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
                   transition: all 0.3s ease;
                 ">
                Reset Password
              </a>
            </div>
            
            <!-- Security notice -->
            <div style="background-color: #1c1917; border-left: 3px solid #dc2626; padding: 16px; border-radius: 6px; margin: 32px 0;">
              <p style="color: #fca5a5; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                Security Notice
              </p>
              <p style="color: #a3a3a3; font-size: 13px; line-height: 1.5; margin: 0;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <!-- Divider -->
            <div style="border-top: 1px solid #2a2a2a; margin: 32px 0;"></div>
            
            <!-- Link fallback -->
            <p style="color: #525252; font-size: 13px; line-height: 1.5; margin: 0;">
              Or copy and paste this link into your browser:<br/>
              <span style="color: #dc2626; word-break: break-all;">${url}</span>
            </p>
          </div>
          
        </div>
      </div>
    `,
  };
}
