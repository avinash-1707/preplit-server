import nodemailer from "nodemailer";
import { verificationEmailTemplate } from "./mailTemplates";

// env validation
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const transporter = nodemailer.createTransport({
  host: requireEnv("SMTP_HOST"),
  port: Number(requireEnv("SMTP_PORT")),
  secure: Number(requireEnv("SMTP_PORT")) === 465,
  auth: {
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Functions

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}): Promise<void> {
  if (!to) {
    throw new Error("Recipient email is required");
  }

  const { subject, text, html } = verificationEmailTemplate({ url });

  await transporter.sendMail({
    from: requireEnv("MAIL_FROM"),
    to,
    subject,
    text,
    html,
  });
}
