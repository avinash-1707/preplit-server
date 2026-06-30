import { test, expect, describe } from "bun:test";

// Integration tests hit a REAL Neon database and require a schema that matches
// the current Drizzle models. Bun auto-loads .env (so DATABASE_URL is usually
// present), but the dev DB may be drifted — so these are gated behind an
// explicit opt-in: run with `RUN_DB_TESTS=1 bun test` against a migrated DB.
const hasDb = process.env.RUN_DB_TESTS === "1";
const MISSING_SESSION = "00000000-0000-0000-0000-000000000000";

describe("interview service integration (DB)", () => {
  test.skipIf(!hasDb)(
    "getEvaluation rejects with NotFoundError for a missing session",
    async () => {
      const svc = await import("./interview.service");
      await expect(
        svc.getEvaluation(MISSING_SESSION, "no-such-user"),
      ).rejects.toBeInstanceOf(svc.NotFoundError);
    },
  );

  test.skipIf(!hasDb)(
    "logEvent rejects with NotFoundError when the session does not exist",
    async () => {
      const svc = await import("./interview.service");
      await expect(
        svc.logEvent(MISSING_SESSION, "no-such-user", {
          sessionProblemId: "x",
          type: "code:update",
          payload: {},
        }),
      ).rejects.toBeInstanceOf(svc.NotFoundError);
    },
  );

  test.skipIf(!hasDb)(
    "endInterview rejects with NotFoundError for a missing session",
    async () => {
      const svc = await import("./interview.service");
      await expect(
        svc.endInterview(MISSING_SESSION, "no-such-user"),
      ).rejects.toBeInstanceOf(svc.NotFoundError);
    },
  );
});
