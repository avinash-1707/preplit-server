import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.HTTP_PORT) || 5000;

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Preplit backend running fine!",
  });
});

httpServer.listen(PORT, () => {
  console.log(`HTTP + Socket.IO server running on port ${PORT}`);
});
