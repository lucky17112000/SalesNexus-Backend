import { NextFunction, Request, Response, Router } from "express";
import { OrganizationController } from "./organization.controller";
import z from "zod";
import { validateRequest } from "../../middlware/validateRequest";
import { createOrganizationSchema } from "./organization.validation";
import { cookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { checkAuth } from "../../middlware/checkAuth";

const router = Router();

router.post(
  "/",
  checkAuth("MEMBER"),

  validateRequest(createOrganizationSchema),
  OrganizationController.createOrganization,
);

export const OrganizationRoutes = router;

//post , patch, put for this we can use zod schema validation and then we can use the validateRequest middleware to validate the request body.
