import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
  if (errorCode === "P2002") {
    return status.CONFLICT;
  }

  if (["P2025", "P2015", "P2001", "P2018"].includes(errorCode)) {
    return status.NOT_FOUND;
  }

  if (["P1000", "P6002"].includes(errorCode)) {
    return status.UNAUTHORIZED;
  }

  if (["P1010", "P6010"].includes(errorCode)) {
    return status.FORBIDDEN;
  }

  if (["P6003"].includes(errorCode)) {
    return status.PAYMENT_REQUIRED;
  }

  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status.GATEWAY_TIMEOUT;
  }

  if (errorCode === "P5011") {
    return status.TOO_MANY_REQUESTS;
  }

  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"]) {
    return status.SERVICE_UNAVAILABLE;
  }

  if (errorCode.startsWith("P2")) {
    return status.BAD_REQUEST;
  }

  if (
    errorCode.startsWith("P3") ||
    errorCode.startsWith("P4") ||
    errorCode.startsWith("P5") ||
    errorCode.startsWith("P6") ||
    errorCode.startsWith("P7") ||
    errorCode.startsWith("P8") ||
    errorCode.startsWith("P9")
  ) {
    return status.INTERNAL_SERVER_ERROR;
  }
  return status.INTERNAL_SERVER_ERROR;
};

const formatErrorMeta = (meta?: Record<string, unknown>): string => {
  if (!meta) return "";
  const parts: string[] = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field : ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column : ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table : ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model : ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation : ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint : ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error : ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};

export const handlePrismaClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): TErrorResponse => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;

  cleanMessage = cleanMessage.replace(/Invalid`.*?`invocation:?\s*/i, "");

  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred with the database operation";
  const errorSource: TErrorSources[] = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage,
    },
  ];

  if (error.meta?.cause) {
    errorSource.push({
      path: "cause",
      message: String(error.meta.cause),
    });
  }

  return {
    statusCode,
    success: false,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources: errorSource,
  };
};

export const handlePrismaClientUnknownRequestError = (
  error: Prisma.PrismaClientUnknownRequestError,
): TErrorResponse => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid`.*?`invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An unknown error occurred with the database operation";
  const errorSource: TErrorSources[] = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage,
    },
  ];

  return {
    statusCode: status.INTERNAL_SERVER_ERROR,
    success: false,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources: errorSource,
  };
};

export const handlePrismaClientValidationError = (
  error: Prisma.PrismaClientValidationError,
): TErrorResponse => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid`.*?`invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());

  const errorSource: TErrorSources[] = [];

  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);

  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage =
    lines.find(
      (line) =>
        !line.includes("Argument") && !line.includes("→") && line.length > 10,
    ) ||
    lines[0] ||
    "Invalid query parameters provided to the db operation";
  errorSource.push({
    path: fieldName,
    message: mainMessage,
  });

  return {
    statusCode: status.BAD_REQUEST,
    success: false,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources: errorSource,
  };
};

export const handlePrismaClientInitializationError = (
  error: Prisma.PrismaClientInitializationError,
): TErrorResponse => {
  const statusCode = error.errorCode
    ? getStatusCodeFromPrismaError(error.errorCode)
    : status.SERVICE_UNAVAILABLE;
  let cleanMessage = error.message;

  cleanMessage = cleanMessage.replace(/Invalid`.*?`invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred while initializing the Prisma Client";
  const errorSource: TErrorSources[] = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage,
    },
  ];

  return {
    statusCode,
    success: false,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources: errorSource,
  };
};

export const handlePrismaClientRustPanicError = (): TErrorResponse => {
  const errorSource: TErrorSources[] = [
    {
      path: "Rust Panic Error",
      message:
        "The database operation caused a rust panic.This is usually caused by invalid query parameters provided to the db operation.Please check the prisma log for more details.",
    },
  ];
  return {
    statusCode: status.INTERNAL_SERVER_ERROR,
    success: false,
    message: "Prisma Client Rust Panic Error",
    errorSources: errorSource,
  };
};
