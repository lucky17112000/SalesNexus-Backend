// src/middlewares/checkAuth.ts

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
      // ============================================
      // ১. সেশন টোকেন চেক করুন
      // ============================================
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

      if (!sessionExists || !sessionExists.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid or expired session");
      }

      const user = sessionExists.user;

      // ============================================
      // ২. সেশন রিফ্রেশ লজিক (আগের মতো)
      // ============================================
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

      // ============================================
      // ৩. ইউজার স্ট্যাটাস চেক করুন
      // ============================================
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
          "User account is deleted. Please contact support.",
        );
      }

      // ============================================
      // ৪. 🎯 Member টেবিল থেকে Role বের করুন
      // ============================================
      // Better Auth-এর সেশনে activeOrganizationId থাকে
      const activeOrgId = (sessionExists as any).activeOrganizationId || null;

      let userRole: string = "member"; // ডিফল্ট রোল

      if (activeOrgId) {
        const member = await prisma.member.findFirst({
          where: {
            userId: user.id,
            organizationId: activeOrgId,
          },
          select: { role: true },
        });

        if (member) {
          userRole = member.role;
        } else {
          // যদি Member না পাওয়া যায়, তাহলে ইউজারের প্রথম Member খুঁজি
          const firstMember = await prisma.member.findFirst({
            where: { userId: user.id },
            select: { role: true },
          });
          if (firstMember) {
            userRole = firstMember.role;
          }
        }
      } else {
        // যদি activeOrganizationId না থাকে, তাহলে ইউজারের প্রথম Member খুঁজি
        const firstMember = await prisma.member.findFirst({
          where: { userId: user.id },
          select: { role: true },
        });
        if (firstMember) {
          userRole = firstMember.role;
        }
      }

      // ============================================
      // ৫. 🛡️ RBAC চেক (প্রথম চেক - সেশন থেকে)
      // ============================================
      if (authRoles.length > 0 && !authRoles.includes(userRole as Role)) {
        throw new AppError(
          status.FORBIDDEN,
          "You are not authorized to access this resource.",
        );
      }

      // ============================================
      // ৬. Access Token চেক করুন (যদি আলাদা Token থাকে)
      // ============================================
      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (accessToken) {
        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          envVars.ACCESS_TOKEN_SECRET,
        );
        if (!verifiedToken.success) {
          throw new AppError(status.UNAUTHORIZED, "Invalid access token");
        }

        // Access Token-এ রোল চেক (যদি থাকে)
        const tokenRole = verifiedToken.decoded?.role as string;
        if (
          authRoles.length > 0 &&
          tokenRole &&
          !authRoles.includes(tokenRole as Role)
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to access this resource.",
          );
        }
      }

      // ============================================
      // ৭. ✅ req.user-এ সব ডেটা বসান
      // ============================================
      req.user = {
        userId: user.id,
        email: user.email,
        role: userRole,
        status: user.status,
        isDeleted: user.isDeleted,
        organizationId: activeOrgId || undefined,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
