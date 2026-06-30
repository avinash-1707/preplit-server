import Fastify, { type FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import interviewRoutes from "../app/interview/interview.route";
import userRoutes from "../app/user/user.route";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { httpAuth } from "../middleware/httpAuth";
import { ok, err } from "../contract/envelope";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

export async function createHttpApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  // CORS first — credentials required for Better Auth's cookie-based sessions.
  await app.register(fastifyCors, {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400,
  });

  // Better Auth — official Fastify integration: bridge Fastify <-> WHATWG
  // Request/Response via auth.handler(). Mounted before the app's own route
  // plugins. Better Auth manages Set-Cookie through the response headers, so no
  // cookie plugin is required here.
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        // Forward headers. Set-Cookie is handled separately via getSetCookie()
        // because Headers.forEach coalesces multiple Set-Cookie values into one
        // (Better Auth can set more than one, e.g. with cookie cache enabled).
        const setCookies = response.headers.getSetCookie?.() ?? [];
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") return;
          reply.header(key, value);
        });
        for (const cookie of setCookies) {
          reply.header("set-cookie", cookie);
        }

        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        console.error("Authentication error:", error);
        return reply
          .status(500)
          .send({ error: "Internal authentication error" });
      }
    },
  });

  // ElevenLabs scribe token (authenticated).
  app.get(
    "/scribe-token",
    { preHandler: httpAuth },
    async (_request, reply) => {
      try {
        const { token } =
          await elevenlabs.tokens.singleUse.create("realtime_scribe");

        if (!token) {
          return reply
            .code(400)
            .send(err("Something went wrong while generating token", "TOKEN"));
        }

        // expiresAt is an ABSOLUTE epoch-ms timestamp (token TTL ~15 min).
        return reply
          .code(200)
          .send(ok({ token, expiresAt: Date.now() + 900_000 }));
      } catch (error) {
        console.error("Token error:", error);
        return reply.code(500).send(err("Server error!", "INTERNAL"));
      }
    },
  );

  // App route plugins.
  await app.register(interviewRoutes, { prefix: "/api/interviews" });
  await app.register(userRoutes, { prefix: "/api/users" });

  // Health check.
  app.get("/", async () => ({
    status: "ok",
    message: "Preplit backend running fine!",
  }));

  // Error + not-found handlers.
  app.setErrorHandler((error, _request, reply) => {
    console.error("Unhandled error:", error);
    reply.status(500).send({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: "Route not found" });
  });

  return app;
}
