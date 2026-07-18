import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSource } from "../interfaces/errorInterFace";
import z from "zod";
import { handleZodError } from "../errorHelper/handleZodeError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): TErrorResponse => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error From Global Error Handler", err);
  }
  const errorSource: TErrorSource[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  if (err instanceof z.ZodError) {
    const simplyFiedError = handleZodError(err);
    statusCode = simplyFiedError.statusCode || status.INTERNAL_SERVER_ERROR;
    message = simplyFiedError.message;
    errorSource.push(...simplyFiedError.errorSource);
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,

    errorSource,
    error: envVars.NODE_ENV === "development" ? err : {},
  };
  res.status(statusCode).json(errorResponse);
  return errorResponse;
};
