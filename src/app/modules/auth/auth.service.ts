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
// import { IRequestUser } from "../../interfaces";

import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import {
  IAdminSignupPayload,
  IchangePasswordPayload,
  IRequestUser,
} from "./auth.interface";

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

//register admin with organization and member schema
const registerAdminAndOrganization = async (payload: IAdminSignupPayload) => {
  const { name, email, password, organizationName } = payload;
  const userData = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!userData.user) {
    throw new AppError(status.BAD_REQUEST, "Admin registration failed");
  }

  const userId = userData.user.id;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug:
            organizationName.toLowerCase().replace(/\s/g, "-") +
            "-" +
            Date.now(),
        },
      });

      const member = await tx.member.create({
        data: {
          userId: userId,
          organizationId: organization.id,
          role: Role.ADMIN,
        },
      });
      return { organization, member };
    });
    return {
      user: userData.user,
      organization: result.organization,
      member: result.member,
    };
  } catch (error) {
    console.error("Transaction failed. Deleting user...");
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to create organization. Registration rolled back.",
    );
  }
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

  const member = await prisma.member.findFirst({
    where: {
      userId: data.user.id,
      // isDeleted: false,
    },
    select: {
      role: true,
      organizationId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  let role = "MEMBER"; // Default role
  let organizationId: string | null = null;

  if (member) {
    role = member.role;
    organizationId = member.organizationId;
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: role as Role,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshoken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: role as Role,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  return { ...data, accessToken, refreshoken };
};

// src/app/modules/auth/auth.service.ts

const getMe = async (user: IRequestUser) => {
  // ১. ইউজারের বেসিক ডেটা বের করুন (role বাদে)
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      status: true,
      isDeleted: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
      image: true,
      // ❌ role বাদ (কারণ এটি User-এ নেই)
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // ২. 🎯 Member টেবিল থেকে role ও organizationId বের করুন
  //    (একজন ইউজার একাধিক অর্গের সদস্য হতে পারে, তাই সব এনে দিন)
  const members = await prisma.member.findMany({
    where: { userId: user.userId },
    select: {
      role: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // ৩. ডিফল্ট রোল ও অর্গানাইজেশন সেট করুন (যদি কোনো Member না থাকে)
  let defaultRole = "member";
  let organizations = members.map((m) => ({
    organizationId: m.organizationId,
    role: m.role,
    organization: m.organization,
  }));

  if (members.length > 0) {
    // প্রথম Member-এর রোলকে ডিফল্ট ধরি
    defaultRole = members[0]?.role ?? defaultRole;
  }

  // ৪. রেসপন্স তৈরি করুন
  return {
    ...userData,
    role: defaultRole, // 👈 ডিফল্ট রোল
    organizations, // 👈 ইউজারের সব অর্গানাইজেশন ও রোল
  };
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

const changePassword = async (
  payload: IchangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      // revokeOtherSessions: true, // Revoke other sessions after password change
    },
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
    },
    select: {
      role: true,
    },
  });

  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: member?.role,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: member?.role,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return { ...result, accessToken, refreshToken };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  return result;
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  registerAdminAndOrganization,
  changePassword,
  logoutUser,
};
