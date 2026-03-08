/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { env } from "node:process";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { handelZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";

import { deleteUploadedFileFromCloudinary } from "../utils/deleteUploadedFileFromCloudinary";
import {
  handlePrismaClientInitializationError,
  handlePrismaClientKnownRequestError,
  handlePrismaClientRustPanicError,
  handlePrismaClientUnknownRequestError,
  handlePrismaClientValidationError,
} from "../errorHelpers/handlePrismaError";
import { Prisma } from "../../generated/prisma/client";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.error("From Global Error Handler", err);
  }

  await deleteUploadedFileFromCloudinary(req);

  let errorSources: TErrorSources[] = [];
  let stack: string | undefined = undefined;
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedPrismaError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedPrismaError.statusCode as number;
    message = simplifiedPrismaError.message;
    errorSources = [...simplifiedPrismaError.errorSources!];
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const simplifiedPrismaError = handlePrismaClientUnknownRequestError(err);
    statusCode = simplifiedPrismaError.statusCode as number;
    message = simplifiedPrismaError.message;
    errorSources = [...simplifiedPrismaError.errorSources!];
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedPrismaError = handlePrismaClientValidationError(err);
    statusCode = simplifiedPrismaError.statusCode as number;
    message = simplifiedPrismaError.message;
    errorSources = [...simplifiedPrismaError.errorSources!];
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    const simplifiedPrismaError = handlePrismaClientInitializationError(err);
    statusCode = simplifiedPrismaError.statusCode as number;
    message = simplifiedPrismaError.message;
    errorSources = [...simplifiedPrismaError.errorSources!];
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    const simplifiedPrismaError = handlePrismaClientRustPanicError();
    statusCode = simplifiedPrismaError.statusCode as number;
    message = simplifiedPrismaError.message;
    errorSources = [...simplifiedPrismaError.errorSources!];
  } else if (err instanceof z.ZodError) {
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
