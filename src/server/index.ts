import { createHttpApp } from "./http";
import { createSocketServer } from "./socket";

/**
 * Builds the Fastify app, waits for it to be ready (so the underlying Node
 * http.Server exists), then attaches Socket.IO to that server. Returns the
 * Fastify instance for the caller to listen on.
 */
export async function createServer() {
  const app = await createHttpApp();
  await app.ready();
  createSocketServer(app.server);
  return app;
}
