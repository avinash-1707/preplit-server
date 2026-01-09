import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "./db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});

export async function validateSessionFromHeaders(headers: any) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    userId: session.user.id,
    name: session.user.name,
  };
}
