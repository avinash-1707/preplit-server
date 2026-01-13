import { betterAuth, type Account } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "./db";
import * as schema from "../db/index";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/sendEmail";
import { attachProviderImageIfMissing } from "../app/user/user.service";

type AccountWithImage = Account & {
  image?: string | null;
};

export interface AuthUser {
  id: string;
  name: string;
  role: string;
}

export const auth = betterAuth({
  // baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CLIENT_URL!],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: { additionalFields: { role: { type: "string", input: false } } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmail({
        to: user.email,
        url,
      });
    },
    autoSignInAfterVerification: true,
    async afterEmailVerification(user, request) {
      void sendWelcomeEmail({ to: user.email, name: user.name });
      console.log(`${user.email} has been successfully verified!`);
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

  account: {
    accountLinking: { enabled: true },
    additionalFields: {
      image: {
        type: "string",
        required: false,
      },
    },
  },

  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          const acc = account as AccountWithImage;
          await attachProviderImageIfMissing(acc.userId, acc.image);
        },
      },
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
