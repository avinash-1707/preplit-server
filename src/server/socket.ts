import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuth } from "../middleware/socketAuth";
import { streamGemini } from "../sockets/llm/llm";

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    let controller: AbortController | null = null;
    console.log(`Socket connected!`);

    socket.on("user:transcript", async ({ text }: { text: string }) => {
      try {
        // cancel any previous generation
        controller?.abort();
        controller = new AbortController();

        socket.emit("llm:start");

        await streamGemini({
          prompt: text,
          signal: controller.signal,
          onToken: (token: string) => {
            socket.emit("llm:token", { token });
          },
        });

        console.log("You reached the point after llm emit");

        socket.emit("llm:done");
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log(err);
          return;
        }

        socket.emit("llm:error", {
          message: "Gemini streaming failed",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected!`);
    });
  });

  return io;
}
