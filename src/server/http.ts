import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import { auth } from "../lib/auth";

export function createHttpApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Preplit backend running fine!",
    });
  });

  return app;
}
