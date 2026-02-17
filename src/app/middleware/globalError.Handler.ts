/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "node:process";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { handelZodError } from "../errorHelpers/handelZodError";
import AppError from "../errorHelpers/AppError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.error("From Global Error Handler", err);
  }

  let errorSources: TErrorSources[] = [];
  let stack: string | undefined = undefined;
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (err instanceof z.ZodError) {
    const simplifiedZodError = handelZodError(err);
    statusCode = simplifiedZodError.statusCode as number;
    message = simplifiedZodError.message;

    errorSources = [...simplifiedZodError.errorSources!];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    stack: env.NODE_ENV === "development" ? stack : undefined,
    error: env.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
