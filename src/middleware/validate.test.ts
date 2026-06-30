import { test, expect, describe } from "bun:test";
import { validate } from "./validate";
import { startInterviewBody, listInterviewsQuery } from "../contract/interview";

function mockReply() {
  return {
    statusCode: 0,
    body: undefined as any,
    code(c: number) {
      this.statusCode = c;
      return this;
    },
    send(p: any) {
      this.body = p;
      return this;
    },
  };
}

describe("validate preHandler", () => {
  test("valid body populates request.valid and does not reply", async () => {
    const request: any = {
      body: { language: "javascript", interviewType: "dsa" },
    };
    const reply: any = mockReply();
    await validate({ body: startInterviewBody })(request, reply);
    expect(reply.statusCode).toBe(0); // no error reply sent
    expect(request.valid.body.language).toBe("javascript");
  });

  test("invalid body replies 400 with a normalized VALIDATION envelope", async () => {
    const request: any = { body: { language: "rust", interviewType: "dsa" } };
    const reply: any = mockReply();
    await validate({ body: startInterviewBody })(request, reply);
    expect(reply.statusCode).toBe(400);
    expect(reply.body.code).toBe("VALIDATION");
    expect(typeof reply.body.error).toBe("string");
  });

  test("coerced query lands on request.valid.query", async () => {
    const request: any = { query: { page: "2", limit: "5" } };
    const reply: any = mockReply();
    await validate({ query: listInterviewsQuery })(request, reply);
    expect(request.valid.query).toEqual({ page: 2, limit: 5 });
  });
});
