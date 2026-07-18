import { NextFunction, Request, Response, Router } from "express";
import { OrganizationController } from "./organization.controller";
import z from "zod";
import { validateRequest } from "../../middlware/validateRequest";
import { createOrganizationSchema } from "./organization.validation";

const router = Router();

router.post(
  "/",
  validateRequest(createOrganizationSchema),
  OrganizationController.createOrganization,
);

export const OrganizationRoutes = router;

//post , patch, put for this we can use zod schema validation and then we can use the validateRequest middleware to validate the request body.
