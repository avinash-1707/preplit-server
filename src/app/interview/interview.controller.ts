import type { Request, Response } from "express";
import { InterviewService } from "./interview.service";

export class InterviewController {
  static async start(req: Request, res: Response) {
    try {
      const candidateId = req.user!.id; // from auth middleware
      const data = await InterviewService.startInterview(candidateId);
      res.json(data);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async finish(req: Request, res: Response) {
    try {
      const { sessionId, score, feedback } = req.body;
      const data = await InterviewService.finishInterview(
        sessionId,
        score,
        feedback,
      );
      res.json(data);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
