import { Router } from "express";
import { OrganizationRoutes } from "../modules/organization/organization.route";
import { AuthRoute } from "../modules/auth/auth.route";
import { InviteRoute } from "../modules/invite/invite.route";
import { checkAuth } from "../middlware/checkAuth";
import { Role } from "../../../prisma/src/generated/prisma/enums";

const router = Router();
router.use("/auth", AuthRoute);
router.use("/organizations", OrganizationRoutes);
router.use("/invites", checkAuth(Role.ADMIN), InviteRoute);

export const IndexRouter = router;
