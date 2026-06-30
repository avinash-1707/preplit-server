import { Router } from "express";
import * as interviewController from "../interview/interview.controller";
import { httpAuth } from "../../middleware/httpAuth";
import { validate } from "../../middleware/validate";
import {
  startInterviewBody,
  sessionIdParams,
  logEventBody,
  listInterviewsQuery,
} from "../../contract/interview";

const router = Router();

/**
 * @route   GET /api/interviews
 * @desc    Get authenticated user's interview sessions (paginated)
 * @access  Private
 * @query   page?, limit?
 */
router.get(
  "/",
  httpAuth,
  validate({ query: listInterviewsQuery }),
  interviewController.getInterviews,
);

/**
 * @route   POST /api/interviews
 * @desc    Start a new interview session (owned by the authenticated user)
 * @access  Private
 */
router.post(
  "/",
  httpAuth,
  validate({ body: startInterviewBody }),
  interviewController.startInterview,
);

/**
 * @route   POST /api/interviews/:sessionId/events
 * @desc    Log an event during the interview (must own the session)
 * @access  Private
 */
router.post(
  "/:sessionId/events",
  httpAuth,
  validate({ params: sessionIdParams, body: logEventBody }),
  interviewController.logEvent,
);

/**
 * @route   POST /api/interviews/:sessionId/end
 * @desc    End interview and generate evaluation (must own the session)
 * @access  Private
 */
router.post(
  "/:sessionId/end",
  httpAuth,
  validate({ params: sessionIdParams }),
  interviewController.endInterview,
);

/**
 * @route   GET /api/interviews/:sessionId/evaluation
 * @desc    Get evaluation for a completed interview (must own the session)
 * @access  Private
 */
router.get(
  "/:sessionId/evaluation",
  httpAuth,
  validate({ params: sessionIdParams }),
  interviewController.getEvaluation,
);

export default router;
