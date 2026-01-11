type VerificationTemplateProps = {
  url: string;
};

export function verificationEmailTemplate({ url }: VerificationTemplateProps) {
  return {
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,

    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up.</p>
        <p>
          Click the button below to verify your email address:
        </p>
        <p>
          <a href="${url}" 
             style="
               display: inline-block;
               padding: 10px 16px;
               background: #000;
               color: #fff;
               text-decoration: none;
               border-radius: 6px;
             ">
            Verify Email
          </a>
        </p>
        <p>If you didn’t create this account, you can ignore this email.</p>
      </div>
    `,
  };
}
