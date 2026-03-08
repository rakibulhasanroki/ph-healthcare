import status from "http-status";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import z from "zod";

export const handelZodError = (err: z.ZodError): TErrorResponse => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("=>"),
      message: issue.message,
    });
  });

  return {
    success: false,
    statusCode,
    message,
    errorSources,
  };
};
