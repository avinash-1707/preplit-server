import http from "http";
import { createHttpApp } from "./http";
import { createSocketServer } from "./socket";

export function createServer() {
  const app = createHttpApp();
  const httpServer = http.createServer(app);

  createSocketServer(httpServer);

  return httpServer;
}
