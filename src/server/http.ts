import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import { auth } from "../lib/auth";
import interviewRoutes from "../app/interview/interview.route";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { httpAuth } from "../middleware/httpAuth";

export function createHttpApp() {
  const app = express();
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

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

  app.get("/scribe-token", httpAuth, async (req, res) => {
    try {
      const { token } = await elevenlabs.tokens.singleUse.create("realtime_scribe");

      console.log("Token generated:", token);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Something went wrong while generating token",
        });
      }

      return res.status(200).json({
        success: true,
        data: { token, expiresAt: 900000 },
      });
    } catch (error) {
      console.error("Token error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error!",
      });
    }
  });


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
