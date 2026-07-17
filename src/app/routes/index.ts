import { Router } from "express";
import { OrganizationRoutes } from "../modules/organization/organization.route";
import { AuthRoute } from "../modules/auth/auth.route";

const router = Router();
router.use("/auth", AuthRoute);
router.use("/organizations", OrganizationRoutes);

export const IndexRouter = router;
