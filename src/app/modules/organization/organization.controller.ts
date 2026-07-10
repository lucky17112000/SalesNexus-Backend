import { NextFunction, Request, RequestHandler, Response } from "express";
import { OrganizationService } from "./organization.service";
import { catchAsync } from "../../../shared/catchAsyc";
import { sendResponse } from "../../../shared/sendRespose";
import { StatusCodes } from "http-status-codes";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.createOrganization(req.body);
  sendResponse(res, {
    httpStatusCode: StatusCodes.CREATED,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

export const OrganizationController = {
  createOrganization,
};
