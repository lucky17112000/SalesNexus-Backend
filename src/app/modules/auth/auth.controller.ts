import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../../shared/sendResponse";
import status from "http-status";
import { setAccessRefreshIntoCookie } from "../../utils/setAccessRefreshIntoCookie";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";
import { cookieUtils } from "../../utils/cookie";

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
const getMe = async (req: Request, res: Response) => {
  // checkAuth মিডলওয়্যার req.user সেট করে দিয়েছে
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AuthService.getMe(user);

  res.status(status.OK).json({
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
};

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

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.changePassword(payload, sessionToken);
  const { accessToken, refreshToken, token } = result;
  setAccessRefreshIntoCookie.setAccessTokenIntoCookie(res, accessToken);
  setAccessRefreshIntoCookie.setRefreshTokenIntoCookie(res, refreshToken);
  setAccessRefreshIntoCookie.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.logoutUser(sessionToken);
  // Clear cookies
  cookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const registerWithInvite = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.registerWithInvite(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully with invite verify your  email",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  registerAdminAndOrganization,
  changePassword,
  logoutUser,
  verifyEmail,
  registerWithInvite,
};
