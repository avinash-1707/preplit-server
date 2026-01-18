// Request/Response Types for Interview API

export interface StartInterviewRequest {
  candidateId: string;
  language: "javascript" | "python" | "cpp";
  interviewType: "javascript" | "dsa" | "backend" | "system-design";
  timeLimitSeconds?: number;
  aiPersona?: "friendly" | "strict" | "faang";
  model?: string;
}

export interface StartInterviewResponse {
  success: boolean;
  data: {
    session: {
      id: string;
      candidateId: string;
      status: string;
      language: string;
      interviewType: string;
      timeLimitSeconds: number | null;
      startedAt: Date;
      endedAt: Date | null;
      aiPersona: string | null;
      model: string | null;
      createdAt: Date;
    };
    problems: Array<{
      id: string;
      sessionId: string;
      problemId: string;
      order: number;
      status: string;
      startedAt: Date | null;
      endedAt: Date | null;
    }>;
  };
}

export interface LogEventRequest {
  sessionProblemId: string;
  type:
    | "code:update"
    | "code:submit"
    | "ai:question"
    | "ai:hint"
    | "ai:feedback"
    | "execution:run"
    | "chat:message"
    | "problem:start"
    | "problem:complete";
  payload: Record<string, any>;
}

export interface LogEventResponse {
  success: boolean;
  data: {
    id: string;
    sessionId: string;
    sessionProblemId: string;
    type: string;
    payload: Record<string, any>;
    createdAt: Date;
  };
}

export interface EndInterviewRequest {
  userId: string;
}

export interface EndInterviewResponse {
  success: boolean;
  data: {
    id: string;
    sessionId: string;
    userId: string;
    problemSolving: number | null;
    coding: number | null;
    debugging: number | null;
    dsa: number | null;
    communication: number | null;
    overallScore: number | null;
    strengthsText: string | null;
    weaknessesText: string | null;
    improvementText: string | null;
    overallSummary: string | null;
    createdAt: Date;
  };
}

export interface GetEvaluationResponse {
  success: boolean;
  data: {
    id: string;
    sessionId: string;
    userId: string;
    problemSolving: number | null;
    coding: number | null;
    debugging: number | null;
    dsa: number | null;
    communication: number | null;
    overallScore: number | null;
    strengthsText: string | null;
    weaknessesText: string | null;
    improvementText: string | null;
    overallSummary: string | null;
    createdAt: Date;
  };
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

// Event Payload Types
export interface CodeUpdatePayload {
  code: string;
  language: string;
  timestamp: number;
}

export interface CodeSubmitPayload {
  code: string;
  language: string;
  passed: boolean;
  testResults?: any[];
}

export interface AIQuestionPayload {
  question: string;
  answer: string;
  context?: string;
}

export interface AIHintPayload {
  hintLevel: number;
  hintText: string;
}

export interface AIFeedbackPayload {
  feedbackType: "positive" | "negative" | "neutral";
  message: string;
  area?: string;
}

export interface ExecutionRunPayload {
  code: string;
  output: string;
  error?: string;
  executionTime?: number;
}
