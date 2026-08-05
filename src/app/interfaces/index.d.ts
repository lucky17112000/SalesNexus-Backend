import { Role } from "../../../prisma/src/generated/prisma/enums";

/*
userId: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          isDeleted: user.isDeleted,
*/

interface IRequestUser {
  userId: string;
  email: string;
  role: Role;
  status: string;
  isDeleted: boolean;
}
declare global {
  namespace Express {
    interface Request {
      user: IRequestUser;
    }
  }
}
