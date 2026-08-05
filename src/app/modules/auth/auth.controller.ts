import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { setAccessRefreshIntoCookie } from "../../utils/setAccessRefreshIntoCookie";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.registerUser(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshoken, token } = result;
  setAccessRefreshIntoCookie.setAccessTokenIntoCookie(res, accessToken);
  setAccessRefreshIntoCookie.setRefreshTokenIntoCookie(res, refreshoken);
  setAccessRefreshIntoCookie.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshoken,
      result,
    },
  });
});

export const AuthController = {
  registerUser,
  loginUser,
};
