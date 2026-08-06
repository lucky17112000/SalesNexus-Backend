// src/types/express.d.ts
import { Role, UserStatus } from "../../../prisma/src/generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        status: UserStatus;
        isDeleted: boolean;
        organizationId?: string;
      };
    }
  }
}
