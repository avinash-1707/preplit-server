import type { Request, Response } from "express";
import { getUserInsightByUserId } from "./user.service";
import { ok, err } from "../../contract/envelope";

export async function getUserInsightsController(req: Request, res: Response) {
  try {
    const userId = req.user?.id; // set by auth middleware

    if (!userId) {
      return res.status(401).json(err("Unauthorized", "UNAUTHORIZED"));
    }

    const insight = await getUserInsightByUserId(userId);

    if (!insight) {
      return res.status(404).json(err("No insights found", "NOT_FOUND"));
    }

    return res.status(200).json(ok(insight));
  } catch (error) {
    console.error("Get user insights error:", error);
    return res.status(500).json(err("Internal server error", "INTERNAL"));
  }
}
