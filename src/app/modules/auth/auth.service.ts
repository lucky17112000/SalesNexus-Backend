import status from "http-status";
import {
  Role,
  User,
  UserStatus,
} from "../../../../prisma/src/generated/prisma/client";

import { ILoginPayload, ISignupPayload } from "../../interfaces/user.interface";
import { auth } from "../../lib/auth";
import AppError from "../../errorHelper/AppError";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";

const registerUser = async (payload: ISignupPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      //   role: Role.MEMBER,
      //    callbackURL: "https://example.com/callback",
    },
  });
  //after registration we will get a token and a user
  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "User registration failed");
  }
  return data;
};

const loginUser = async (payload: ILoginPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe: true,
    },
  });
  if (!data.user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  if (data.user.status === UserStatus.INACTIVE) {
    throw new AppError(
      status.FORBIDDEN,
      "User account is inactive. Please contact support.",
    );
  }
  if (data.user.status === UserStatus.BANNED) {
    throw new AppError(
      status.FORBIDDEN,
      "User account is banned. Please contact support.",
    );
  }
  if (data.user.status === UserStatus.DELETED) {
    throw new AppError(
      status.GONE,
      "User account is deleted. Please contact support.",
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshoken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  return { ...data, accessToken, refreshoken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    select: {
      // organization:true
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return isUserExist;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!isSessionTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );
  if (!verifiedRefreshToken.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }
  // Generate a new access token
  const data = verifiedRefreshToken.decoded as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });
  const updatedSession = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //! 1 days
      updatedAt: new Date(),
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: updatedSession.token,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
};
