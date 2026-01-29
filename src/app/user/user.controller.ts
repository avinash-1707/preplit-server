import type { Request, Response } from "express";
import { getUserInsightByUserId } from "./user.service";

export async function getUserInsightsController(
    req: Request,
    res: Response
) {
    try {
        const userId = req.user?.id; // set by auth middleware

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const insight = await getUserInsightByUserId(userId);

        if (!insight) {
            return res.status(404).json({ message: "No insights found" });
        }

        return res.status(200).json({ data: insight });
    } catch (error) {
        console.error("Get user insights error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}