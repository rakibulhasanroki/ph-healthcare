import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const parsedResult = schema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }

    req.body = parsedResult.data;
    next();
  };
};
