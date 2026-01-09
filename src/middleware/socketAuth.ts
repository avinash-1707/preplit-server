import { Socket } from "socket.io";
import { validateSessionFromHeaders } from "../lib/auth";

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    socket.user = await validateSessionFromHeaders(socket.handshake.headers);
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
