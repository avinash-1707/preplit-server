import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";

export function createHttpApp() {
  const app = express();

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Preplit backend running fine!",
    });
  });

  return app;
}
