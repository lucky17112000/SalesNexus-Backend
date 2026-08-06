import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { inviteService } from "./invite.service";
import { sendResponse } from "../../../shared/sendResponse";

const createInvite = catchAsync(async (req: Request, res: Response) => {
  const inviterId = req.user?.userId;
  if (!inviterId) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }
  const result = await inviteService.createInvite(req.body, inviterId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Invitation created successfully",
    data: {
      ...result,
      invitedLink: result.inviteLink,
      invite: result.invite,
    },
  });
});

export const InviteController = {
  createInvite,
};
