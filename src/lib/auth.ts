import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "./db";
import * as schema from "../db/index";
import { sendVerificationEmail } from "../utils/sendEmail";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
}

export const auth = betterAuth({
  // baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: { additionalFields: { role: { type: "string", input: false } } },
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmail({
        to: user.email,
        url,
      });
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

type Session = typeof auth.$Infer.Session;

export async function validateSessionFromHeaders(headers: any) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    role: session.user.role,
  };
}
