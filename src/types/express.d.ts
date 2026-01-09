import type { AuthUser } from "../lib/auth";

declare module "express-serve-static-core" {
  export interface Request {
    user?: AuthUser;
  }
}
