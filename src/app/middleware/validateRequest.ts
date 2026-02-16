import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = schema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }

    req.body = parsedResult.data;
    next();
  };
};
