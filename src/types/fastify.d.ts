import "fastify";
import type { AuthUser } from "../lib/auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    // Contract-validated request parts, populated by the validate() preHandler.
    valid?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}
