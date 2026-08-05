import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../../prisma/src/generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelper/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Session token is missing");
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentageRemaining = (timeRemaining / sessionLifeTime) * 100;
        if (percentageRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());

          console.log("Session Expiring Soon!!");
        }

        if (
          user.status === UserStatus.INACTIVE ||
          user.status === UserStatus.BANNED ||
          user.status === UserStatus.DELETED
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "User account is not active. Please contact support.",
          );
        }

        if (user.isDeleted) {
          throw new AppError(
            status.GONE,
            "User account is deleted candidate. Please contact support.",
          );
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
          throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to access this resource.",
          );
        }

        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          isDeleted: user.isDeleted,
        };
      }

      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Access token is missing");
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );
      if (!verifiedToken.success) {
        throw new AppError(status.UNAUTHORIZED, "Invalid access token");
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.decoded!.role as Role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "You are not authorized to create an organization",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
