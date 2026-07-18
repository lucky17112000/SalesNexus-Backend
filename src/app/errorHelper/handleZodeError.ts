import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/errorInterFace";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSource: TErrorSource[] = [];
  err.issues.forEach((issue) => {
    errorSource.push({
      path:
        issue.path.length > 1
          ? issue.path.join(".")
          : issue.path[0]?.toString() || "",
      message: issue.message,
    });
  });
  return {
    success: false,
    message,
    errorSource,
    error: {},
  };
};
