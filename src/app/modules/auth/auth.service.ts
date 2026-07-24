import status from "http-status";
import {
  Role,
  User,
  UserStatus,
} from "../../../../prisma/src/generated/prisma/client";
import AppError from "../../errorHelper/Apperror";
import { ILoginPayload, ISignupPayload } from "../../interfaces/user.interface";
import { auth } from "../../lib/auth";

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
  return data;
};
export const AuthService = {
  registerUser,
  loginUser,
};
