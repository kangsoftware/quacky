import type { Session, User } from "better-auth/types";

declare module "better-auth/types" {
  interface User {
    handle?: string | null;
    role?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;
  }
}
