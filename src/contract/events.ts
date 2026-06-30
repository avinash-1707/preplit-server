import { z } from "zod";

/**
 * Socket.IO transport contract (shared client/server).
 */

// client → server
export const userTranscriptPayload = z.object({
  text: z.string().min(1).max(8000),
});
export type UserTranscriptPayload = z.infer<typeof userTranscriptPayload>;

// server → client
export interface LlmTokenEvent {
  token: string;
}
export interface LlmErrorEvent {
  message: string;
}

export const SOCKET_EVENTS = {
  userTranscript: "user:transcript",
  llmStart: "llm:start",
  llmToken: "llm:token",
  llmDone: "llm:done",
  llmError: "llm:error",
} as const;
