import { NextFunction, Request, RequestHandler, Response } from "express";
import { OrganizationService } from "./organization.service";
import { catchAsync } from "../../../shared/catchAsync";
import { sendResponse } from "../../../shared/sendResponse";

import status from "http-status";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.createOrganization(req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

export const OrganizationController = {
  createOrganization,
};
