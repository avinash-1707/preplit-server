import type { Request, Response, NextFunction } from "express";
import { validateSessionFromHeaders } from "../lib/auth";

export async function httpAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.user = await validateSessionFromHeaders(req.headers);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
}

export function isInterviewer(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "INTERVIEWER" && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Interviewer access only" });
  }

  next();
}
