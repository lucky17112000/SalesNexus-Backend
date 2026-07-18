import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = zodSchema.safeParse(req.body);
    // const parsedResult = createOrganizationSchema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }
    //sanitizing data
    req.body = parsedResult.data;
    console.log("After zod validation", req.body);
    next();
  };
};
