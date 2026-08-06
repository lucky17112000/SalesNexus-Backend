import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlware/checkAuth";
import { Role } from "../../../../prisma/src/generated/prisma/enums";

const router = Router();
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);

router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/register-admin",

  AuthController.registerAdminAndOrganization,
);
router.post(
  "/change-password",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
  AuthController.changePassword,
);
router.post("/verify-email", AuthController.verifyEmail);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
  AuthController.getMe,
);
router.post(
  "/logout",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MEMBER),
  AuthController.logoutUser,
);
export const AuthRoute = router;
