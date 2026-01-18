import { Router } from "express";
import * as interviewController from "../interview/interview.controller";

const router = Router();

/**
 * @route   POST /api/interviews
 * @desc    Start a new interview session
 * @access  Private
 * @body    { candidateId, language, interviewType, timeLimitSeconds?, aiPersona?, model? }
 */
router.post("/", interviewController.startInterview);

/**
 * @route   POST /api/interviews/:sessionId/events
 * @desc    Log an event during the interview
 * @access  Private
 * @body    { sessionProblemId, type, payload }
 */
router.post("/:sessionId/events", interviewController.logEvent);

/**
 * @route   POST /api/interviews/:sessionId/end
 * @desc    End interview and generate evaluation
 * @access  Private
 * @body    { userId }
 */
router.post("/:sessionId/end", interviewController.endInterview);

/**
 * @route   GET /api/interviews/:sessionId/evaluation
 * @desc    Get evaluation for a completed interview
 * @access  Private
 */
router.get("/:sessionId/evaluation", interviewController.getEvaluation);

export default router;
