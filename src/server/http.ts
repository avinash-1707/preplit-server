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
    // Match the breadth of the old Express `app.all` so no Better Auth verb
    // (e.g. revoke/update/delete endpoints) falls through to the 404 handler.
    // OPTIONS preflight is handled by @fastify/cors.
    method: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        // Host is used only to give auth.handler a path+query to route on;
        // Better Auth derives its security-sensitive base URL from its own
        // config / trustedOrigins, not from this reconstructed URL.
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);

        const hasBody = request.body != null;
        if (hasBody) {
          // Fastify already parsed the JSON body. We re-serialize it, so make
          // the content-type match and drop the stale content-length (which
          // reflected the original raw bytes, not the re-serialized string).
          headers.set("content-type", "application/json");
          headers.delete("content-length");
        }

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(hasBody ? { body: JSON.stringify(request.body) } : {}),
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

        return reply.send(response.body ? await response.text() : "");
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

  // Error + not-found handlers. Honors statusCode/code carried by HttpError
  // (thrown from preHandler hooks) and keeps 500s from leaking details.
  app.setErrorHandler((error, _request, reply) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    const code = (error as { code?: string }).code;
    if (statusCode >= 500) {
      console.error("Unhandled error:", error);
      return reply.status(500).send({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      });
    }
    const message = error instanceof Error ? error.message : "Request failed";
    return reply
      .status(statusCode)
      .send(code ? err(message, code) : err(message));
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: "Route not found" });
  });

  return app;
}
