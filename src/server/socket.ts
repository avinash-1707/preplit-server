import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import { socketAuth } from "../middleware/socketAuth";
import { streamGemini } from "../sockets/llm/llm";
// import { streamTtsToSocket } from "../sockets/tts/streamTtsToSocket";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

// Bounds for the LLM proxy to prevent cost/quota abuse.
const MAX_TRANSCRIPT_CHARS = 8000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function isAllowedOrigin(origin?: string): boolean {
  // No Origin header → not a browser cross-site request (e.g. native client).
  if (!origin) return true;
  return origin === CLIENT_URL;
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
    },
    // `cors` only guards the HTTP long-polling transport. The WebSocket
    // upgrade bypasses CORS, so we validate the Origin here to prevent
    // Cross-Site WebSocket Hijacking against the cookie-authenticated socket.
    allowRequest: (req: IncomingMessage, callback) => {
      callback(null, isAllowedOrigin(req.headers.origin));
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    let controller: AbortController | null = null;
    const requestTimestamps: number[] = [];
    console.log(`Socket connected!`);

    socket.on("user:transcript", async (payload: unknown) => {
      try {
        // ---- Input validation ----
        const text =
          payload && typeof (payload as any).text === "string"
            ? (payload as any).text.trim()
            : null;

        if (!text) {
          socket.emit("llm:error", { message: "transcript text is required" });
          return;
        }
        if (text.length > MAX_TRANSCRIPT_CHARS) {
          socket.emit("llm:error", {
            message: `transcript exceeds ${MAX_TRANSCRIPT_CHARS} characters`,
          });
          return;
        }

        // ---- Per-socket rate limit ----
        const now = Date.now();
        while (
          requestTimestamps.length > 0 &&
          now - requestTimestamps[0]! > RATE_LIMIT_WINDOW_MS
        ) {
          requestTimestamps.shift();
        }
        if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
          socket.emit("llm:error", {
            message: "Rate limit exceeded. Slow down.",
          });
          return;
        }
        requestTimestamps.push(now);

        // cancel any previous generation
        controller?.abort();
        controller = new AbortController();

        socket.emit("llm:start");

        await streamGemini({
          prompt: text,
          signal: controller.signal,
          onToken: (token: string) => {
            socket.emit("llm:token", { token });
            // on premium plan (elevenlabs tts)
            // streamTtsToSocket(socket, token);
          },
        });

        socket.emit("llm:done");
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }

        socket.emit("llm:error", {
          message: "Gemini streaming failed",
        });
      }
    });

    socket.on("disconnect", () => {
      controller?.abort();
      console.log(`Socket disconnected!`);
    });
  });

  return io;
}
