import { z } from "zod";

/**
 * ElevenLabs scribe token response. `expiresAt` is an ABSOLUTE epoch-ms
 * timestamp (Date.now() + ttl), not a duration — the client compares it
 * against Date.now().
 */
export const scribeTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.number().int(),
});
export type ScribeToken = z.infer<typeof scribeTokenSchema>;
