import { Router } from "express";
import { OrganizationController } from "./organization.controller";

const router = Router();
router.post("/", OrganizationController.createOrganization);

export const OrganizationRoutes = router;
