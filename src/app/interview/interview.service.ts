import { and, eq } from "drizzle-orm";
import {
  interviewEvaluation,
  interviewProblem,
  interviewSession,
  interviewSessionProblem,
} from "../../db";
import { db } from "../../lib/db";

export class InterviewService {
  static async startInterview(candidateId: string) {
    // 1. Pick problems (simple example: 3 random problems)
    const problems = await db.select().from(interviewProblem).limit(3);
    if (!problems.length) throw new Error("No interview problems available");

    // 2. Create session
    const [session] = await db
      .insert(interviewSession)
      .values({ candidateId, status: "active" })
      .returning();

    // 3. Attach problems to session
    const sessionProblems = problems.map((p, i) => ({
      sessionId: session.id,
      problemId: p.id,
      order: i + 1,
      status: i === 0 ? "active" : "pending",
      startedAt: i === 0 ? new Date() : null,
    }));

    await db.insert(interviewSessionProblem).values(sessionProblems);

    return { sessionId: session.id };
  }

  static async finishInterview(
    sessionId: string,
    score: number,
    feedback: string,
  ) {
    // 1. Close session
    await db
      .update(interviewSession)
      .set({ status: "completed", endedAt: new Date() })
      .where(eq(interviewSession.id, sessionId));

    // 2. Close all problems
    await db
      .update(interviewSessionProblem)
      .set({ status: "completed", endedAt: new Date() })
      .where(eq(interviewSessionProblem.sessionId, sessionId));

    // 3. Save evaluation
    await db.insert(interviewEvaluation).values({ sessionId, score, feedback });

    return { ok: true };
  }
}
