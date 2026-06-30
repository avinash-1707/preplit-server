import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import type { FastifyInstance } from "fastify";
import { createHttpApp } from "./http";

// Integration tests via Fastify's app.inject(). These exercise the REAL router,
// preHandler hooks, and 404/health handlers without a DB: unauthenticated
// requests carry no session cookie, so httpAuth replies 401 before any
// controller/service (and before any DB query) runs. This locks the access-
// control gating that the Express->Fastify migration could silently regress.
let app: FastifyInstance;

beforeAll(async () => {
  app = await createHttpApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("http app — public routes", () => {
  test("GET / returns health ok", async () => {
    const res = await app.inject({ method: "GET", url: "/" });
    expect(res.statusCode).toBe(200);
    expect(res.json() as Record<string, unknown>).toMatchObject({
      status: "ok",
    });
  });

  test("unknown route returns the 404 envelope", async () => {
    const res = await app.inject({ method: "GET", url: "/does-not-exist" });
    expect(res.statusCode).toBe(404);
    expect(res.json() as Record<string, unknown>).toEqual({
      error: "Route not found",
    });
  });
});

describe("http app — protected routes require auth (401 unauthenticated)", () => {
  const protectedRoutes: Array<[string, string]> = [
    ["GET", "/api/interviews"],
    ["POST", "/api/interviews"],
    ["POST", "/api/interviews/abc/events"],
    ["POST", "/api/interviews/abc/end"],
    ["GET", "/api/interviews/abc/evaluation"],
    ["GET", "/api/users/me/insights"],
    ["GET", "/scribe-token"],
  ];

  for (const [method, url] of protectedRoutes) {
    test(`${method} ${url} -> 401 without a session`, async () => {
      const res = await app.inject({ method: method as any, url });
      // 401 proves: the route is wired (not 404), httpAuth ran and halted the
      // lifecycle before the controller, and no DB call leaked a 500.
      expect(res.statusCode).toBe(401);
    });
  }
});
