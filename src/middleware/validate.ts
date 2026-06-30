import type { FastifyRequest, FastifyReply } from "fastify";
import type { ZodType } from "zod";
import { err } from "../contract/envelope";

/**
 * Fastify preHandler factory: validates request parts against contract Zod
 * schemas and stashes the parsed (coerced) values on request.valid. Replies 400
 * (and halts) on the first validation failure.
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const valid: { body?: unknown; query?: unknown; params?: unknown } = {};
      if (schemas.params) valid.params = schemas.params.parse(request.params);
      if (schemas.query) valid.query = schemas.query.parse(request.query);
      if (schemas.body) valid.body = schemas.body.parse(request.body);
      request.valid = valid;
    } catch (e: any) {
      const message =
        e?.issues?.[0]?.message ?? e?.message ?? "Invalid request";
      return reply.code(400).send(err(message, "VALIDATION"));
    }
  };
}
