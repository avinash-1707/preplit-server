import { test, expect, describe } from "bun:test";
import { validate } from "./validate";
import { HttpError } from "../lib/httpError";
import {
  startInterviewBody,
  listInterviewsQuery,
  sessionIdParams,
  logEventBody,
} from "../contract/interview";

describe("validate preHandler", () => {
  test("valid body populates request.valid", async () => {
    const request: any = {
      body: { language: "javascript", interviewType: "dsa" },
    };
    await validate({ body: startInterviewBody })(request);
    expect(request.valid.body.language).toBe("javascript");
  });

  test("invalid body throws HttpError(400, VALIDATION)", async () => {
    const request: any = { body: { language: "rust", interviewType: "dsa" } };
    let thrown: any;
    try {
      await validate({ body: startInterviewBody })(request);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(HttpError);
    expect(thrown.statusCode).toBe(400);
    expect(thrown.code).toBe("VALIDATION");
    expect(typeof thrown.message).toBe("string");
  });

  test("coerced query lands on request.valid.query", async () => {
    const request: any = { query: { page: "2", limit: "5" } };
    await validate({ query: listInterviewsQuery })(request);
    expect(request.valid.query).toEqual({ page: 2, limit: 5 });
  });

  test("validates params and body together", async () => {
    const request: any = {
      params: { sessionId: "s1" },
      body: { sessionProblemId: "sp1", type: "code:update", payload: {} },
    };
    await validate({ params: sessionIdParams, body: logEventBody })(request);
    expect(request.valid.params).toEqual({ sessionId: "s1" });
    expect(request.valid.body.type).toBe("code:update");
  });
});
