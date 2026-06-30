import { test, expect, describe } from "bun:test";
import { validate } from "./validate";
import { startInterviewBody, listInterviewsQuery } from "../contract/interview";

function mockRes() {
  return {
    statusCode: 0,
    body: undefined as any,
    locals: {} as Record<string, any>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
}

describe("validate middleware", () => {
  test("passes valid body to next() and reassigns req.body", () => {
    const req: any = {
      body: { language: "javascript", interviewType: "dsa" },
    };
    const res: any = mockRes();
    let nextCalled = false;
    validate({ body: startInterviewBody })(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(req.body.language).toBe("javascript");
  });

  test("returns 400 normalized error on invalid body", () => {
    const req: any = { body: { language: "rust", interviewType: "dsa" } };
    const res: any = mockRes();
    let nextCalled = false;
    validate({ body: startInterviewBody })(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("VALIDATION");
    expect(typeof res.body.error).toBe("string");
  });

  test("coerced query lands on res.locals.valid.query", () => {
    const req: any = { query: { page: "2", limit: "5" } };
    const res: any = mockRes();
    validate({ query: listInterviewsQuery })(req, res, () => {});
    expect(res.locals.valid.query).toEqual({ page: 2, limit: 5 });
  });
});
