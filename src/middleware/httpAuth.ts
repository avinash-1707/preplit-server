import type { FastifyRequest } from "fastify";
import { validateSessionFromHeaders } from "../lib/auth";
import { HttpError } from "../lib/httpError";

/**
 * Fastify preHandler hook: authenticates from request headers and sets
 * request.user. Throws (which reliably halts the Fastify lifecycle — a sent
 * reply returned from an async hook does NOT) on failure; the error handler
 * maps it to a 401 envelope.
 */
export async function httpAuth(request: FastifyRequest) {
  try {
    request.user = await validateSessionFromHeaders(request.headers);
  } catch {
    throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
  }
}

export async function isAdmin(request: FastifyRequest) {
  if (!request.user) {
    throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
  }
  if (request.user.role !== "ADMIN") {
    throw new HttpError(403, "Admin access only", "FORBIDDEN");
  }
}

export async function isInterviewer(request: FastifyRequest) {
  if (!request.user) {
    throw new HttpError(401, "Unauthorized", "UNAUTHORIZED");
  }
  if (request.user.role !== "INTERVIEWER" && request.user.role !== "ADMIN") {
    throw new HttpError(403, "Interviewer access only", "FORBIDDEN");
  }
}
