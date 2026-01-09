import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuth } from "../middleware/socketAuth";

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
