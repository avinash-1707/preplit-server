import type { FastifyRequest, FastifyReply } from "fastify";
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
  SessionIdParams,
} from "../../contract/interview";

/**
 * Maps a thrown service error to a normalized error envelope + HTTP status.
 */
function handleError(reply: FastifyReply, error: any, fallbackMsg: string) {
  if (error instanceof ValidationError) {
    return reply.code(400).send(err(error.message, "VALIDATION"));
  }
  if (error instanceof ForbiddenError) {
    return reply.code(403).send(err(error.message, "FORBIDDEN"));
  }
  if (error instanceof NotFoundError) {
    return reply.code(404).send(err(error.message, "NOT_FOUND"));
  }
  console.error(`${fallbackMsg}:`, error);
  return reply.code(500).send(err(fallbackMsg, "INTERNAL"));
}

export async function startInterview(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;
    if (!userId) return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));

    const body = request.body as StartInterviewBody;

    // Identity comes from the authenticated session, never from the body.
    const result = await interviewService.startInterview({
      candidateId: userId,
      language: body.language,
      interviewType: body.interviewType,
      timeLimitSeconds: body.timeLimitSeconds,
      aiPersona: body.aiPersona,
      model: body.model,
    });

    return reply.code(201).send(ok(result));
  } catch (error: any) {
    return handleError(reply, error, "Failed to start interview");
  }
}

export async function logEvent(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user?.id;
    if (!userId) return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = request.params as SessionIdParams;
    const body = request.body as LogEventBody;

    const event = await interviewService.logEvent(sessionId, userId, {
      sessionProblemId: body.sessionProblemId,
      type: body.type,
      payload: body.payload,
    });

    return reply.code(201).send(ok(event));
  } catch (error: any) {
    return handleError(reply, error, "Failed to log event");
  }
}

export async function endInterview(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;
    if (!userId) return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = request.params as SessionIdParams;

    const evaluation = await interviewService.endInterview(sessionId, userId);

    return reply.code(200).send(ok(evaluation));
  } catch (error: any) {
    return handleError(reply, error, "Failed to end interview");
  }
}

export async function getEvaluation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;
    if (!userId) return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));

    const { sessionId } = request.params as SessionIdParams;

    const evaluation = await interviewService.getEvaluation(sessionId, userId);

    return reply.code(200).send(ok(evaluation));
  } catch (error: any) {
    return handleError(reply, error, "Failed to get evaluation");
  }
}

export async function getInterviews(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user?.id;
    if (!userId) return reply.code(401).send(err("Unauthorized", "UNAUTHORIZED"));

    // Validated + coerced by `validate({ query: listInterviewsQuery })`.
    const { page, limit } = request.valid!.query as ListInterviewsQuery;

    const result = await interviewService.getInterviewsByCandidateId(userId, {
      page,
      limit,
    });

    return reply.code(200).send(ok(result.sessions, result.pagination));
  } catch (error: any) {
    return handleError(reply, error, "Failed to get interviews");
  }
}
