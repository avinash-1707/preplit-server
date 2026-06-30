import { z } from "zod";

// Enums lifted from the hand-rolled arrays in interview.controller.ts so the
// allowed values live in exactly one place.
export const interviewLanguage = z.enum(["javascript", "python", "cpp"]);
export type InterviewLanguage = z.infer<typeof interviewLanguage>;

export const interviewType = z.enum([
  "javascript",
  "dsa",
  "backend",
  "system-design",
]);
export type InterviewType = z.infer<typeof interviewType>;

export const interviewEventType = z.enum([
  "code:update",
  "code:submit",
  "ai:question",
  "ai:hint",
  "ai:feedback",
  "execution:run",
  "chat:message",
  "problem:start",
  "problem:complete",
]);
export type InterviewEventType = z.infer<typeof interviewEventType>;

// ---- Requests ----

export const aiPersona = z.enum(["friendly", "strict", "faang"]);
export type AiPersona = z.infer<typeof aiPersona>;

export const startInterviewBody = z.object({
  language: interviewLanguage,
  interviewType: interviewType,
  timeLimitSeconds: z.number().int().positive().optional(),
  aiPersona: aiPersona.optional(),
  model: z.string().optional(),
});
export type StartInterviewBody = z.infer<typeof startInterviewBody>;

export const sessionIdParams = z.object({
  sessionId: z.string().min(1),
});
export type SessionIdParams = z.infer<typeof sessionIdParams>;

export const logEventBody = z.object({
  sessionProblemId: z.string().min(1),
  type: interviewEventType,
  // PROVISIONAL: event payload shape is intentionally loose until the real
  // interview/AI pipeline pins it down.
  payload: z.record(z.string(), z.unknown()),
});
export type LogEventBody = z.infer<typeof logEventBody>;

export const listInterviewsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListInterviewsQuery = z.infer<typeof listInterviewsQuery>;

// ---- Responses (PROVISIONAL) ----
// The evaluation payload will be reshaped once the real AI evaluation pipeline
// exists (streaming, partial, schema-volatile). Keep it loose on purpose.
export const evaluationSchema = z.unknown();
export type Evaluation = z.infer<typeof evaluationSchema>;
