import type { Request, Response } from "express";
import * as interviewService from "../interview/interview.service";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../interview/interview.service";

/**
 * Maps a thrown service error to an HTTP response. Keeps controllers DRY and
 * ensures ownership/validation errors never surface as a generic 500.
 */
function handleError(res: Response, error: any, fallbackMsg: string) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  if (error instanceof ForbiddenError) {
    return res.status(403).json({ error: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  console.error(`${fallbackMsg}:`, error);
  return res.status(500).json({ error: fallbackMsg });
}

export async function startInterview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { language, interviewType, timeLimitSeconds, aiPersona, model } =
      req.body;

    if (!language || !interviewType) {
      return res.status(400).json({
        error: "Missing required fields: language, interviewType",
      });
    }

    const validLanguages = ["javascript", "python", "cpp"];
    const validTypes = ["javascript", "dsa", "backend", "system-design"];

    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        error: `Invalid language. Must be one of: ${validLanguages.join(", ")}`,
      });
    }

    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        error: `Invalid interview type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Identity comes from the authenticated session, never from the body.
    const result = await interviewService.startInterview({
      candidateId: userId,
      language,
      interviewType,
      timeLimitSeconds,
      aiPersona,
      model,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return handleError(res, error, "Failed to start interview");
  }
}

export async function logEvent(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId } = req.params;
    const { sessionProblemId, type, payload } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing required field: sessionId" });
    }

    if (!sessionProblemId || !type || !payload) {
      return res.status(400).json({
        error: "Missing required fields: sessionProblemId, type, payload",
      });
    }

    const validEventTypes = [
      "code:update",
      "code:submit",
      "ai:question",
      "ai:hint",
      "ai:feedback",
      "execution:run",
      "chat:message",
      "problem:start",
      "problem:complete",
    ];

    if (!validEventTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}`,
      });
    }

    const event = await interviewService.logEvent(sessionId, userId, {
      sessionProblemId,
      type,
      payload,
    });

    return res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    return handleError(res, error, "Failed to log event");
  }
}

export async function endInterview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing required field: sessionId" });
    }

    const evaluation = await interviewService.endInterview(sessionId, userId);

    return res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    return handleError(res, error, "Failed to end interview");
  }
}

export async function getEvaluation(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session id missing!" });
    }

    const evaluation = await interviewService.getEvaluation(sessionId, userId);

    return res.status(200).json({ success: true, data: evaluation });
  } catch (error: any) {
    return handleError(res, error, "Failed to get evaluation");
  }
}

export async function getInterviews(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pageValue = Number(req.query.page ?? 1);
    const limitValue = Number(req.query.limit ?? 10);

    if (!Number.isInteger(pageValue) || pageValue < 1) {
      return res.status(400).json({
        error: "Invalid page. Must be an integer >= 1",
      });
    }

    if (!Number.isInteger(limitValue) || limitValue < 1 || limitValue > 100) {
      return res.status(400).json({
        error: "Invalid limit. Must be an integer between 1 and 100",
      });
    }

    const result = await interviewService.getInterviewsByCandidateId(userId, {
      page: pageValue,
      limit: limitValue,
    });

    return res.status(200).json({
      success: true,
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return handleError(res, error, "Failed to get interviews");
  }
}
