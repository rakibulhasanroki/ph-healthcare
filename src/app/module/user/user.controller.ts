import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";

import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { UserService } from "./user.service";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await UserService.createDoctor(payload);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Doctor registered successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req.body, req.user!);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

export const UserController = {
  createDoctor,
  createAdmin,
};
