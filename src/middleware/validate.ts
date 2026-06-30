import type { FastifyRequest } from "fastify";
import type { ZodType } from "zod";
import { HttpError } from "../lib/httpError";

/**
 * Fastify preHandler factory: validates request parts against contract Zod
 * schemas and stashes the parsed (coerced) values on request.valid. Throws an
 * HttpError(400) on the first validation failure — throwing (not returning a
 * sent reply) is what reliably halts the Fastify lifecycle before the handler.
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return async (request: FastifyRequest) => {
    try {
      const valid: { body?: unknown; query?: unknown; params?: unknown } = {};
      if (schemas.params) valid.params = schemas.params.parse(request.params);
      if (schemas.query) valid.query = schemas.query.parse(request.query);
      if (schemas.body) valid.body = schemas.body.parse(request.body);
      request.valid = valid;
    } catch (e: any) {
      const message =
        e?.issues?.[0]?.message ?? e?.message ?? "Invalid request";
      throw new HttpError(400, message, "VALIDATION");
    }
  };
}
