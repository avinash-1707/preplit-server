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
