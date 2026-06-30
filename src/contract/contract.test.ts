import { test, expect, describe } from "bun:test";
import {
  startInterviewBody,
  logEventBody,
  listInterviewsQuery,
  interviewType,
} from "./interview";
import { scribeTokenSchema } from "./scribe";
import { userTranscriptPayload } from "./events";
import { ok, err, apiErrorSchema, paginationSchema } from "./envelope";

describe("interview contract", () => {
  test("startInterviewBody accepts a valid body", () => {
    const parsed = startInterviewBody.parse({
      language: "javascript",
      interviewType: "dsa",
    });
    expect(parsed.language).toBe("javascript");
    expect(parsed.interviewType).toBe("dsa");
  });

  test("startInterviewBody rejects an invalid language", () => {
    expect(() =>
      startInterviewBody.parse({ language: "rust", interviewType: "dsa" }),
    ).toThrow();
  });

  test("startInterviewBody rejects an invalid interviewType", () => {
    expect(() =>
      startInterviewBody.parse({ language: "python", interviewType: "frontend" }),
    ).toThrow();
  });

  test("logEventBody rejects an unknown event type", () => {
    expect(() =>
      logEventBody.parse({
        sessionProblemId: "sp1",
        type: "code:explode",
        payload: {},
      }),
    ).toThrow();
  });

  test("logEventBody accepts an arbitrary (provisional) payload", () => {
    const parsed = logEventBody.parse({
      sessionProblemId: "sp1",
      type: "code:update",
      payload: { code: "x", anything: 123 },
    });
    expect(parsed.type).toBe("code:update");
  });

  test("interviewType enum lists the four supported topics", () => {
    expect(interviewType.options).toEqual([
      "javascript",
      "dsa",
      "backend",
      "system-design",
    ]);
  });
});

describe("listInterviewsQuery", () => {
  test("applies defaults when empty", () => {
    const parsed = listInterviewsQuery.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(10);
  });

  test("coerces string query params to numbers", () => {
    const parsed = listInterviewsQuery.parse({ page: "3", limit: "25" });
    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(25);
  });

  test("rejects limit above 100", () => {
    expect(() => listInterviewsQuery.parse({ limit: "500" })).toThrow();
  });

  test("rejects page below 1", () => {
    expect(() => listInterviewsQuery.parse({ page: "0" })).toThrow();
  });
});

describe("scribe + events contracts", () => {
  test("scribeTokenSchema requires token + numeric expiresAt", () => {
    const parsed = scribeTokenSchema.parse({ token: "t", expiresAt: 123 });
    expect(parsed.token).toBe("t");
    expect(() => scribeTokenSchema.parse({ token: "t" })).toThrow();
  });

  test("userTranscriptPayload enforces non-empty, bounded text", () => {
    expect(userTranscriptPayload.parse({ text: "hi" }).text).toBe("hi");
    expect(() => userTranscriptPayload.parse({ text: "" })).toThrow();
    expect(() =>
      userTranscriptPayload.parse({ text: "x".repeat(8001) }),
    ).toThrow();
  });
});

describe("envelope helpers", () => {
  test("ok() wraps data without pagination", () => {
    expect(ok({ a: 1 })).toEqual({ success: true, data: { a: 1 } });
  });

  test("ok() includes pagination when provided", () => {
    const pg = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
    const env = ok([], pg);
    expect(env.pagination).toEqual(pg);
    expect(paginationSchema.parse(pg)).toEqual(pg);
  });

  test("err() produces a normalized error envelope", () => {
    expect(err("nope", "X")).toEqual({ error: "nope", code: "X" });
    expect(apiErrorSchema.parse(err("nope"))).toEqual({ error: "nope" });
  });
});
