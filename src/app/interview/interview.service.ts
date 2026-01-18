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

export interface StartInterviewInput {
  candidateId: string;
  language: string;
  interviewType: string;
  timeLimitSeconds?: number;
  aiPersona?: string;
  model?: string;
}

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

export async function startInterview(input: StartInterviewInput) {
  // Create session
  const [session] = await db
    .insert(interviewSession)
    .values({
      candidateId: input.candidateId,
      language: input.language,
      interviewType: input.interviewType,
      timeLimitSeconds: input.timeLimitSeconds,
      aiPersona: input.aiPersona || "friendly",
      model: input.model || "claude-sonnet-4-20250514",
      status: "active",
    })
    .returning();

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

  // Update user insights
  await updateUserInsights(userId, evaluation);

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

async function updateUserInsights(
  userId: string,
  evaluation: EvaluationResult,
) {
  // Check if user insights exist
  const existing = await db
    .select()
    .from(userInsight)
    .where(eq(userInsight.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing insights with weighted average
    const current = existing[0];
    const total = current.totalInterviews || 0;
    const weight = total / (total + 1);
    const newWeight = 1 / (total + 1);

    await db
      .update(userInsight)
      .set({
        problemSolving: Math.round(
          (current.problemSolving || 0) * weight +
            (evaluation.problemSolving || 0) * newWeight,
        ),
        coding: Math.round(
          (current.coding || 0) * weight + (evaluation.coding || 0) * newWeight,
        ),
        debugging: Math.round(
          (current.debugging || 0) * weight +
            (evaluation.debugging || 0) * newWeight,
        ),
        dsa: Math.round(
          (current.dsa || 0) * weight + (evaluation.dsa || 0) * newWeight,
        ),
        communication: Math.round(
          (current.communication || 0) * weight +
            (evaluation.communication || 0) * newWeight,
        ),
        totalInterviews: total + 1,
        lastEvaluatedAt: new Date(),
      })
      .where(eq(userInsight.userId, userId));
  } else {
    // Create new insights
    await db.insert(userInsight).values({
      userId,
      problemSolving: evaluation.problemSolving,
      coding: evaluation.coding,
      debugging: evaluation.debugging,
      dsa: evaluation.dsa,
      communication: evaluation.communication,
      totalInterviews: 1,
      lastEvaluatedAt: new Date(),
    });
  }
}
