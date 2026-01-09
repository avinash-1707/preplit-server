import "better-auth/types";
import type { UserRole } from "../constants/roles";

declare module "better-auth" {
  interface User {
    role: UserRole;
  }
}
