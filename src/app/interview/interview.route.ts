import type { FastifyInstance } from "fastify";
import * as interviewController from "../interview/interview.controller";
import { httpAuth } from "../../middleware/httpAuth";
import { validate } from "../../middleware/validate";
import {
  startInterviewBody,
  sessionIdParams,
  logEventBody,
  listInterviewsQuery,
} from "../../contract/interview";

/**
 * Interview routes (Fastify plugin). Registered with prefix /api/interviews.
 * Every route is gated by httpAuth; inputs are validated against the contract.
 */
export default async function interviewRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [httpAuth, validate({ query: listInterviewsQuery })] },
    interviewController.getInterviews,
  );

  app.post(
    "/",
    { preHandler: [httpAuth, validate({ body: startInterviewBody })] },
    interviewController.startInterview,
  );

  app.post(
    "/:sessionId/events",
    {
      preHandler: [
        httpAuth,
        validate({ params: sessionIdParams, body: logEventBody }),
      ],
    },
    interviewController.logEvent,
  );

  app.post(
    "/:sessionId/end",
    { preHandler: [httpAuth, validate({ params: sessionIdParams })] },
    interviewController.endInterview,
  );

  app.get(
    "/:sessionId/evaluation",
    { preHandler: [httpAuth, validate({ params: sessionIdParams })] },
    interviewController.getEvaluation,
  );
}
