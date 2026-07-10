import { Router } from "express";
import { OrganizationRoutes } from "../modules/organization/organization.route";

const router = Router();
router.use("/organizations", OrganizationRoutes);

export const IndexRouter = router;
