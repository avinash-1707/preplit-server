import {
  interviewSession,
  interviewSessionProblem,
  interviewEvent,
  interviewEvaluation,
  interviewProblem,
} from "../../db/interview.schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../lib/db";
import type { StartInterviewRequest } from "../../types/interview.types";

export interface LogEventInput {
  sessionProblemId: string;
  type: string;
  payload: Record<string, any>;
}

export interface EvaluationResult {
  problemSolving?: number | null;
  coding?: number | null;
  debugging?: number | null;
  dsa?: number | null;
  communication?: number | null;
  overallScore?: number | null;
  strengthsText?: string | null;
  weaknessesText?: string | null;
  improvementText?: string | null;
  overallSummary?: string | null;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

/**
 * Typed errors so the controller can map them to HTTP status codes without
 * leaking internals or guessing from string matching.
 */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Invalid request") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Loads a session and asserts it belongs to `userId`.
 * Throws NotFoundError if it doesn't exist, ForbiddenError if owned by someone else.
 */
async function loadOwnedSession(sessionId: string, userId: string) {
  const [session] = await db
    .select()
    .from(interviewSession)
    .where(eq(interviewSession.id, sessionId))
    .limit(1);

  if (!session) {
    throw new NotFoundError("Interview session not found");
  }
  if (session.candidateId !== userId) {
    throw new ForbiddenError("You do not have access to this interview session");
  }
  return session;
}

export async function getInterviewsByCandidateId(
  candidateId: string,
  pagination: PaginationInput,
) {
  const offset = (pagination.page - 1) * pagination.limit;

  const sessions = await db
    .select()
    .from(interviewSession)
    .where(eq(interviewSession.candidateId, candidateId))
    .orderBy(desc(interviewSession.createdAt))
    .limit(pagination.limit)
    .offset(offset);

  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(interviewSession)
    .where(eq(interviewSession.candidateId, candidateId));

  const total = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    sessions,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}

export async function startInterview(input: StartInterviewRequest) {
  // The candidate is always the authenticated caller (set by the controller).
  // Create session
  const [session] = await db
    .insert(interviewSession)
    .values({
      candidateId: input.candidateId,
      language: input.language,
      interviewType: input.interviewType,
      timeLimitSeconds: input.timeLimitSeconds,
      aiPersona: input.aiPersona || "friendly",
      model: input.model || "gemini-2.5-flash",
      status: "active",
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create interview session");
  }

  // Get problems based on interview type
  const problems = await db
    .select()
    .from(interviewProblem)
    .where(eq(interviewProblem.topic, input.interviewType))
    .limit(3);

  if (problems.length === 0) {
    // No problem bank for this interview type — fail loudly instead of
    // attempting an empty insert (Drizzle throws on `values([])`).
    throw new ValidationError(
      `No problems are configured for interview type "${input.interviewType}"`,
    );
  }

  // Create session problems
  const sessionProblems = await db
    .insert(interviewSessionProblem)
    .values(
      problems.map((problem, index) => ({
        sessionId: session.id,
        problemId: problem.id,
        order: index + 1,
        status: index === 0 ? "active" : "pending",
        startedAt: index === 0 ? new Date() : null,
      })),
    )
    .returning();

  return {
    session,
    problems: sessionProblems,
  };
}

export async function logEvent(
  sessionId: string,
  userId: string,
  input: LogEventInput,
) {
  // Ownership check before any write.
  await loadOwnedSession(sessionId, userId);

  // The session problem must belong to this session.
  const [sessionProblem] = await db
    .select()
    .from(interviewSessionProblem)
    .where(
      and(
        eq(interviewSessionProblem.id, input.sessionProblemId),
        eq(interviewSessionProblem.sessionId, sessionId),
      ),
    )
    .limit(1);

  if (!sessionProblem) {
    throw new ValidationError(
      "sessionProblemId does not belong to this session",
    );
  }

  const event = await db
    .insert(interviewEvent)
    .values({
      sessionId,
      sessionProblemId: input.sessionProblemId,
      type: input.type,
      payload: input.payload,
    })
    .returning();

  return event[0];
}

export async function endInterview(sessionId: string, userId: string) {
  const session = await loadOwnedSession(sessionId, userId);

  // Idempotency: if this session was already evaluated, return the existing
  // evaluation instead of inserting a duplicate (the unique constraint on
  // interview_evaluation.sessionId would otherwise raise a 500 on replay).
  const [existing] = await db
    .select()
    .from(interviewEvaluation)
    .where(eq(interviewEvaluation.sessionId, sessionId))
    .limit(1);

  if (existing) {
    return existing;
  }

  // Gather signal for evaluation.
  const events = await db
    .select()
    .from(interviewEvent)
    .where(eq(interviewEvent.sessionId, sessionId))
    .orderBy(desc(interviewEvent.createdAt));

  const sessionProblems = await db
    .select()
    .from(interviewSessionProblem)
    .where(eq(interviewSessionProblem.sessionId, sessionId));

  const evaluation = await runAIEvaluation(events, sessionProblems);

  // NOTE: the neon-http driver does not support interactive transactions, so
  // these two writes are not atomic. Ordering is chosen so a partial failure
  // is safe and retryable: insert the evaluation FIRST (the unique constraint
  // + the idempotency check above make a retry safe), then flip the session
  // status. If the status update fails, a subsequent call short-circuits on
  // `existing` and still completes.
  let savedEvaluation;
  try {
    [savedEvaluation] = await db
      .insert(interviewEvaluation)
      .values({
        sessionId,
        userId,
        ...evaluation,
      })
      .returning();
  } catch (err: any) {
    // Concurrent double-submit: another request inserted first. Return theirs.
    const [raced] = await db
      .select()
      .from(interviewEvaluation)
      .where(eq(interviewEvaluation.sessionId, sessionId))
      .limit(1);
    if (raced) return raced;
    throw err;
  }

  if (session.status !== "completed") {
    await db
      .update(interviewSession)
      .set({ status: "completed", endedAt: new Date() })
      .where(eq(interviewSession.id, sessionId));
  }

  return savedEvaluation;
}

export async function getEvaluation(sessionId: string, userId: string) {
  await loadOwnedSession(sessionId, userId);

  const [evaluation] = await db
    .select()
    .from(interviewEvaluation)
    .where(eq(interviewEvaluation.sessionId, sessionId))
    .limit(1);

  if (!evaluation) {
    throw new NotFoundError("Evaluation not found");
  }

  return evaluation;
}

/**
 * Placeholder evaluation. The real scoring model is not implemented yet, so we
 * do NOT fabricate numbers — scores are left null and the summary states that
 * evaluation is pending. This avoids persisting random data that users would
 * read as a real assessment.
 *
 * TODO: implement real evaluation from `events` (code submissions, AI
 * interactions, etc.) against each problem's rubric.
 */
async function runAIEvaluation(
  _events: any[],
  _sessionProblems: any[],
): Promise<EvaluationResult> {
  return {
    problemSolving: null,
    coding: null,
    debugging: null,
    dsa: null,
    communication: null,
    overallScore: null,
    strengthsText: null,
    weaknessesText: null,
    improvementText: null,
    overallSummary:
      "Automated evaluation is not yet available for this session.",
  };
}
