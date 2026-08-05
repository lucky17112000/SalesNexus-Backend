import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { setAccessRefreshIntoCookie } from "../../utils/setAccessRefreshIntoCookie";
import { tokenUtils } from "../../utils/token";

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
const registerAdminAndOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.registerAdminAndOrganization(req.body);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Admin and Organization registered successfully",
      data: result,
    });
  },
);
const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await AuthService.getMe(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.getNewToken(refreshToken, sessionToken);
  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  } = result;
  setAccessRefreshIntoCookie.setAccessTokenIntoCookie(res, accessToken);
  setAccessRefreshIntoCookie.setRefreshTokenIntoCookie(res, newRefreshToken);
  setAccessRefreshIntoCookie.setBetterAuthSessionCookie(res, newSessionToken);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New token generated successfully",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  registerAdminAndOrganization,
};
