import type { Request, Response } from "express";
import * as interviewService from "../interview/interview.service";
import { success } from "better-auth";

export async function startInterview(req: Request, res: Response) {
  try {
    const {
      candidateId,
      language,
      interviewType,
      timeLimitSeconds,
      aiPersona,
      model,
    } = req.body;

    // Validation
    if (!candidateId || !language || !interviewType) {
      return res.status(400).json({
        error: "Missing required fields: candidateId, language, interviewType",
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

    const result = await interviewService.startInterview({
      candidateId,
      language,
      interviewType,
      timeLimitSeconds,
      aiPersona,
      model,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error starting interview:", error);
    return res.status(500).json({
      error: "Failed to start interview",
      message: error.message,
    });
  }
}

export async function logEvent(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { sessionProblemId, type, payload } = req.body;

    // Validation
    if (!sessionId) {
      return res.status(400).json({
        error: "Missing required field: sessionId",
      });
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

    const event = await interviewService.logEvent(sessionId, {
      sessionProblemId,
      type,
      payload,
    });

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Error logging event:", error);
    return res.status(500).json({
      error: "Failed to log event",
      message: error.message,
    });
  }
}

export async function endInterview(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Missing required field: userId",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        error: "Missing required field: sessionId",
      });
    }

    const evaluation = await interviewService.endInterview(sessionId, userId);

    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error("Error ending interview:", error);
    return res.status(500).json({
      error: "Failed to end interview",
      message: error.message,
    });
  }
}

export async function getEvaluation(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    if (!sessionId)
      return res
        .status(400)
        .json({ success: false, message: "Session id missing!" });

    const evaluation = await interviewService.getEvaluation(sessionId);

    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error("Error getting evaluation:", error);

    if (error.message === "Evaluation not found") {
      return res.status(404).json({
        error: "Evaluation not found for this session",
      });
    }

    return res.status(500).json({
      error: "Failed to get evaluation",
      message: error.message,
    });
  }
}
