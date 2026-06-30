import type { Request, Response } from "express";
import * as interviewService from "../interview/interview.service";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../interview/interview.service";
import { ok, err } from "../../contract/envelope";
import type {
  StartInterviewBody,
  LogEventBody,
  ListInterviewsQuery,
} from "../../contract/interview";

/**
 * Maps a thrown service error to a normalized error envelope + HTTP status.
 */
function handleError(res: Response, error: any, fallbackMsg: string) {
  if (error instanceof ValidationError) {
    return res.status(400).json(err(error.message, "VALIDATION"));
  }
  if (error instanceof ForbiddenError) {
    return res.status(403).json(err(error.message, "FORBIDDEN"));
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json(err(error.message, "NOT_FOUND"));
  }
  console.error(`${fallbackMsg}:`, error);
  return res.status(500).json(err(fallbackMsg, "INTERNAL"));
}

export async function startInterview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));

    // Validated by `validate(startInterviewBody)` middleware.
    const body = req.body as StartInterviewBody;

    // Identity comes from the authenticated session, never from the body.
    const result = await interviewService.startInterview({
      candidateId: userId,
      language: body.language,
      interviewType: body.interviewType,
      timeLimitSeconds: body.timeLimitSeconds,
      aiPersona: body.aiPersona,
      model: body.model,
    });

    return res.status(201).json(ok(result));
  } catch (error: any) {
    return handleError(res, error, "Failed to start interview");
  }
}

export async function logEvent(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = req.params;
    const body = req.body as LogEventBody;

    const event = await interviewService.logEvent(sessionId!, userId, {
      sessionProblemId: body.sessionProblemId,
      type: body.type,
      payload: body.payload,
    });

    return res.status(201).json(ok(event));
  } catch (error: any) {
    return handleError(res, error, "Failed to log event");
  }
}

export async function endInterview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = req.params;

    const evaluation = await interviewService.endInterview(sessionId!, userId);

    return res.status(200).json(ok(evaluation));
  } catch (error: any) {
    return handleError(res, error, "Failed to end interview");
  }
}

export async function getEvaluation(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = req.params;

    const evaluation = await interviewService.getEvaluation(sessionId!, userId);

    return res.status(200).json(ok(evaluation));
  } catch (error: any) {
    return handleError(res, error, "Failed to get evaluation");
  }
}

export async function getInterviews(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));

    // Validated + coerced by `validate({ query: listInterviewsQuery })`.
    const { page, limit } = res.locals.valid.query as ListInterviewsQuery;

    const result = await interviewService.getInterviewsByCandidateId(userId, {
      page,
      limit,
    });

    return res.status(200).json(ok(result.sessions, result.pagination));
  } catch (error: any) {
    return handleError(res, error, "Failed to get interviews");
  }
}
