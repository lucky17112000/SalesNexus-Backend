import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlware/checkAuth";
import { Role } from "../../../../prisma/src/generated/prisma/enums";

const router = Router();
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
  AuthController.getMe,
);
export const AuthRoute = router;
