import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { err } from "../contract/envelope";

export interface ValidatedData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

/**
 * Validates request parts against contract Zod schemas. Parsed (and coerced)
 * values are placed on `res.locals.valid` — controllers read from there.
 *
 * NOTE: in Express 5 `req.query` is a read-only getter, so we never reassign
 * it; only `req.body` is safely reassignable.
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const valid: ValidatedData = {};
      if (schemas.params) valid.params = schemas.params.parse(req.params);
      if (schemas.query) valid.query = schemas.query.parse(req.query);
      if (schemas.body) {
        valid.body = schemas.body.parse(req.body);
        req.body = valid.body;
      }
      res.locals.valid = valid;
      next();
    } catch (e: any) {
      const message =
        e?.issues?.[0]?.message ?? e?.message ?? "Invalid request";
      return res.status(400).json(err(message, "VALIDATION"));
    }
  };
}
