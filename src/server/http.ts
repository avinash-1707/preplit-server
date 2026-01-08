import express from "express";
import cors from "cors";

export function createHttpApp() {
  const app = express();

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
