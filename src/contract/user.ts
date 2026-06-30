import { z } from "zod";

/**
 * User insight payload. PROVISIONAL — the aggregation is still mock; keep the
 * response shape loose until the real insight computation lands.
 */
export const userInsightSchema = z.unknown();
export type UserInsight = z.infer<typeof userInsightSchema>;
