import { Response } from "express";
import { cookieUtils } from "./cookie";

const setAccessTokenIntoCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 1000,
  });
};

const setRefreshTokenIntoCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 1000,
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 1000,
  });
};

export const setAccessRefreshIntoCookie = {
  setAccessTokenIntoCookie,
  setRefreshTokenIntoCookie,
  setBetterAuthSessionCookie,
};
