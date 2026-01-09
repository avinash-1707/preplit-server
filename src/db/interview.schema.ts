import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const interviewProblem = pgTable("interview_problem", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // easy | medium | hard
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewSession = pgTable("interview_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: text("candidate_id")
    .references(() => user.id)
    .notNull(),
  status: text("status").default("active"), // active | completed | aborted
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const interviewSessionProblem = pgTable("interview_session_problem", {
  id: uuid("id").defaultRandom().primaryKey(),

  sessionId: uuid("session_id")
    .references(() => interviewSession.id, { onDelete: "cascade" })
    .notNull(),

  problemId: uuid("problem_id")
    .references(() => interviewProblem.id)
    .notNull(),

  order: integer("order").notNull(), // 1, 2, 3...

  status: text("status").default("pending"),
  // pending | active | completed | skipped

  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

/* ---------- Event Log ---------- */
export const interviewEvent = pgTable("interview_event", {
  id: uuid("id").defaultRandom().primaryKey(),

  sessionId: uuid("session_id")
    .references(() => interviewSession.id, { onDelete: "cascade" })
    .notNull(),

  sessionProblemId: uuid("session_problem_id")
    .references(() => interviewSessionProblem.id, {
      onDelete: "cascade",
    })
    .notNull(),

  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/*
type examples:
- code:update
- code:submit
- ai:question
- ai:hint
- ai:feedback
- execution:run
*/

export const interviewEvaluation = pgTable("interview_evaluation", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => interviewSession.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  score: integer("score"),
  feedback: text("feedback"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
