import { test, expect, describe } from "bun:test";

// Auth smoke test. Imports the real Better Auth instance and queries the
// session table, so it needs a real migrated DB. Gated behind the same
// explicit opt-in as the other DB tests: `RUN_DB_TESTS=1 bun test`.
const hasEnv = process.env.RUN_DB_TESTS === "1";

describe("auth (smoke)", () => {
  test.skipIf(!hasEnv)(
    "validateSessionFromHeaders rejects when there is no session",
    async () => {
      const { validateSessionFromHeaders } = await import("./auth");
      await expect(validateSessionFromHeaders({})).rejects.toThrow(
        "Unauthorized",
      );
    },
  );
});
