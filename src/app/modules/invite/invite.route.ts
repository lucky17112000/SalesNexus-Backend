import { Router } from "express";
import { InviteController } from "./invite.controller";

const router = Router();
router.post("/", InviteController.createInvite);
export const InviteRoute = router;
