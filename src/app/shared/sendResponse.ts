import { Response } from "express";

interface IResponseData<T> {
  httpStatus: number;
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  ResponseData: IResponseData<T>,
) => {
  const { httpStatus, message, success, data } = ResponseData;
  res.status(httpStatus).json({
    success,
    message,
    data,
  });
};
