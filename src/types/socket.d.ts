import "socket.io";
import type { AuthUser } from "../lib/auth";

declare module "socket.io" {
  interface Socket {
    user?: AuthUser;
  }
}
