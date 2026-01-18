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

  difficulty: text("difficulty").notNull(), // beginner | intermediate | advanced
  topic: text("topic").notNull(), // javascript | dsa | backend | system-design

  // What this problem evaluates
  skillMap: jsonb("skill_map").notNull(),
  /*
  Example:
  {
    "fundamentals": 0.4,
    "problemSolving": 0.3,
    "coding": 0.2,
    "debugging": 0.1
  }
  */

  // Starter context for AI
  starterCode: text("starter_code"),
  constraints: text("constraints"),
  expectedApproach: text("expected_approach"),

  // AI Guidance
  hints: jsonb("hints"), // ["Think about closures", "How does scope work?"]
  followUps: jsonb("follow_ups"), // ["How would you optimize this?", "Edge cases?"]

  // Evaluation rubric (AI uses this)
  rubric: jsonb("rubric"),
  /*
  {
    "excellent": "...",
    "good": "...",
    "average": "...",
    "poor": "..."
  }
  */

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewSession = pgTable("interview_session", {
  id: uuid("id").defaultRandom().primaryKey(),

  candidateId: text("candidate_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),

  status: text("status").default("active"),
  // active | completed | aborted | expired

  // Interview config
  language: text("language").notNull(), // javascript | python | cpp
  interviewType: text("interview_type").notNull(), // js-basics | dsa | backend | system-design

  // Runtime control
  timeLimitSeconds: integer("time_limit_seconds"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),

  // AI state
  aiPersona: text("ai_persona"), // friendly | strict | faang
  model: text("model_name"), // gpt-4.1 | claude-3.5 | etc

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewSessionProblem = pgTable("interview_session_problem", {
  id: uuid("id").defaultRandom().primaryKey(),

  sessionId: uuid("session_id")
    .references(() => interviewSession.id, { onDelete: "cascade" })
    .notNull(),

  problemId: uuid("problem_id")
    .references(() => interviewProblem.id)
    .notNull(),

  order: integer("order").notNull(),

  status: text("status").default("pending"),
  // pending | active | completed | skipped

  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const interviewEvent = pgTable("interview_event", {
  id: uuid("id").defaultRandom().primaryKey(),

  sessionId: uuid("session_id")
    .references(() => interviewSession.id, { onDelete: "cascade" })
    .notNull(),

  sessionProblemId: uuid("session_problem_id")
    .references(() => interviewSessionProblem.id, { onDelete: "cascade" })
    .notNull(),

  type: text("type").notNull(), // see taxonomy below
  payload: jsonb("payload").notNull(), // structured data only

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

  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),

  // Core signal (0–100)
  problemSolving: integer("problem_solving"),
  coding: integer("coding"),
  debugging: integer("debugging"),
  dsa: integer("dsa"),
  communication: integer("communication"),

  overallScore: integer("overall_score"),

  // Human-readable insight
  strengthsText: text("strengths_text"),
  weaknessesText: text("weaknesses_text"),
  improvementText: text("improvement_text"),
  overallSummary: text("overall_summary"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userInsight = pgTable("user_insight", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // Core
  problemSolving: integer("problem_solving"),
  coding: integer("coding"),
  debugging: integer("debugging"),
  fundamentals: integer("fundamentals"),
  communication: integer("communication"),

  // Optional (later)
  algorithmicThinking: integer("algorithmic_thinking"),
  testing: integer("testing"),
  dsa: integer("dsa"),
  systemDesign: integer("system_design"),

  totalInterviews: integer("total_interviews").default(0).notNull(),
  lastEvaluatedAt: timestamp("last_evaluated_at"),
});
