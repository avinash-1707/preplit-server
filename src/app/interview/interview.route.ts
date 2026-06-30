import { Router } from "express";
import * as interviewController from "../interview/interview.controller";
import { httpAuth } from "../../middleware/httpAuth";

const router = Router();

/**
 * @route   GET /api/interviews
 * @desc    Get authenticated user's interview sessions (paginated)
 * @access  Private
 * @query   page?, limit?
 */
router.get("/", httpAuth, interviewController.getInterviews);

/**
 * @route   POST /api/interviews
 * @desc    Start a new interview session (owned by the authenticated user)
 * @access  Private
 * @body    { language, interviewType, timeLimitSeconds?, aiPersona?, model? }
 */
router.post("/", httpAuth, interviewController.startInterview);

/**
 * @route   POST /api/interviews/:sessionId/events
 * @desc    Log an event during the interview (must own the session)
 * @access  Private
 * @body    { sessionProblemId, type, payload }
 */
router.post("/:sessionId/events", httpAuth, interviewController.logEvent);

/**
 * @route   POST /api/interviews/:sessionId/end
 * @desc    End interview and generate evaluation (must own the session)
 * @access  Private
 */
router.post("/:sessionId/end", httpAuth, interviewController.endInterview);

/**
 * @route   GET /api/interviews/:sessionId/evaluation
 * @desc    Get evaluation for a completed interview (must own the session)
 * @access  Private
 */
router.get(
  "/:sessionId/evaluation",
  httpAuth,
  interviewController.getEvaluation,
);

export default router;
