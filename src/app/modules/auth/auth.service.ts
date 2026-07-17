import {
  Role,
  User,
  UserStatus,
} from "../../../../prisma/src/generated/prisma/client";
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
    throw new Error("User registration failed");
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
    throw new Error("User login failed");
  }

  if (data.user.status === UserStatus.INACTIVE) {
    throw new Error("User account is inactive. Please contact support.");
  }
  if (data.user.status === UserStatus.BANNED) {
    throw new Error("User account is banned. Please contact support.");
  }
  if (data.user.status === UserStatus.DELETED) {
    throw new Error("User account is deleted. Please contact support.");
  }
  return data;
};
export const AuthService = {
  registerUser,
  loginUser,
};
