import type { FastifyRequest, FastifyReply } from "fastify";
import { validateSessionFromHeaders } from "../lib/auth";

/**
 * Fastify preHandler hook: authenticates from request headers and sets
 * request.user. Replies 401 (and halts the lifecycle) when unauthenticated.
 */
export async function httpAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    request.user = await validateSessionFromHeaders(request.headers);
  } catch {
    return reply.code(401).send({ error: "Unauthorized" });
  }
}

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  if (request.user.role !== "ADMIN") {
    return reply.code(403).send({ error: "Admin access only" });
  }
}

export async function isInterviewer(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  if (request.user.role !== "INTERVIEWER" && request.user.role !== "ADMIN") {
    return reply.code(403).send({ error: "Interviewer access only" });
  }
}
