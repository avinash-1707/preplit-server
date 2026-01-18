import { Router } from "express";
import { InterviewController } from "./interview.controller";

const router = Router();

router.post("/start", InterviewController.start);
router.post("/finish", InterviewController.finish);

export default router;
