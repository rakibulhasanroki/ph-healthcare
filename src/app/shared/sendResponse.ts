import { Response } from "express";

interface IResponseData<T> {
  httpStatus: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(
  res: Response,
  ResponseData: IResponseData<T>,
) => {
  const { httpStatus, message, success, data, meta } = ResponseData;
  res.status(httpStatus).json({
    success,
    message,
    data,
    meta,
  });
};
