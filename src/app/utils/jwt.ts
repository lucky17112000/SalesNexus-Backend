import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import AppError from "../errorHelper/AppError";
import status from "http-status";

const createToken = (
  payload: JwtPayload,
  secret: string,
  { expiresIn }: SignOptions,
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      message: "Token verified successfully",
      decoded: decoded,
    };
  } catch (error: any) {
    // throw new AppError(status.UNAUTHORIZED, "Invalid token");
    return {
      success: false,
      message: "Invalid token",
      errorSource: [],
      stack: error.stack,
      error: error,
    };
  }
};
const decodeToken = (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload;
  return decoded;
};

export const jwtUtils = {
  createToken,
  verifyToken,
  decodeToken,
};
