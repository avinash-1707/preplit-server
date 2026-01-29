import {
  interviewSession,
  interviewSessionProblem,
  interviewEvent,
  interviewEvaluation,
  userInsight,
  interviewProblem,
} from "../../db/interview.schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../lib/db";
import type { StartInterviewRequest } from "../../types/interview.types";

export interface LogEventInput {
  sessionProblemId: string;
  type: string;
  payload: Record<string, any>;
}

export interface EvaluationResult {
  problemSolving?: number;
  coding?: number;
  debugging?: number;
  dsa?: number;
  communication?: number;
  overallScore?: number;
  strengthsText?: string;
  weaknessesText?: string;
  improvementText?: string;
  overallSummary?: string;
}

export async function startInterview(input: StartInterviewRequest) {
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

  if (!session) return

  // Get problems based on interview type and difficulty
  const problems = await db
    .select()
    .from(interviewProblem)
    .where(eq(interviewProblem.topic, input.interviewType))
    .limit(3);

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

export async function logEvent(sessionId: string, input: LogEventInput) {
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
  // Update session status
  await db
    .update(interviewSession)
    .set({
      status: "completed",
      endedAt: new Date(),
    })
    .where(eq(interviewSession.id, sessionId));

  // Get all events for evaluation
  const events = await db
    .select()
    .from(interviewEvent)
    .where(eq(interviewEvent.sessionId, sessionId))
    .orderBy(desc(interviewEvent.createdAt));

  // Get session problems
  const sessionProblems = await db
    .select()
    .from(interviewSessionProblem)
    .where(eq(interviewSessionProblem.sessionId, sessionId));

  // Run AI evaluation
  const evaluation = await runAIEvaluation(events, sessionProblems);

  // Save evaluation
  const [savedEvaluation] = await db
    .insert(interviewEvaluation)
    .values({
      sessionId,
      userId,
      ...evaluation,
    })
    .returning();

  return savedEvaluation;
}

export async function getEvaluation(sessionId: string) {
  const evaluation = await db
    .select()
    .from(interviewEvaluation)
    .where(eq(interviewEvaluation.sessionId, sessionId))
    .limit(1);

  if (!evaluation.length) {
    throw new Error("Evaluation not found");
  }

  return evaluation[0];
}

async function runAIEvaluation(
  events: any[],
  sessionProblems: any[],
): Promise<EvaluationResult> {
  // TODO: Implement actual AI evaluation logic
  // This would analyze events (code submissions, AI interactions, etc.)
  // and generate scores based on the rubric

  // Placeholder implementation
  const codeEvents = events.filter((e) => e.type.startsWith("code:"));
  const aiEvents = events.filter((e) => e.type.startsWith("ai:"));

  return {
    problemSolving: Math.floor(Math.random() * 40) + 60,
    coding: Math.floor(Math.random() * 40) + 60,
    debugging: Math.floor(Math.random() * 40) + 60,
    dsa: Math.floor(Math.random() * 40) + 60,
    communication: Math.floor(Math.random() * 40) + 60,
    overallScore: Math.floor(Math.random() * 40) + 60,
    strengthsText: "Strong problem-solving approach and clear communication",
    weaknessesText: "Could improve code optimization and edge case handling",
    improvementText:
      "Practice more algorithmic problems and focus on time complexity",
    overallSummary:
      "Good performance with room for improvement in advanced topics",
  };
}