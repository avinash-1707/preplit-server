import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import { auth } from "../lib/auth";
import interviewRoutes from "../app/interview/interview.route";

export function createHttpApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api/interviews", interviewRoutes);

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    },
  );

  // 404 handler
  app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
      error: "Route not found",
    });
  });

  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Preplit backend running fine!",
    });
  });

  return app;
}
