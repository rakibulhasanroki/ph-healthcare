import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import { Request, Response } from "express";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmins();

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: result,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.getAdminById(id as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.updateAdmin(id as string, req.body);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

const softDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.softDeleteAdmin(id as string, req.user!);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  softDeleteAdmin,
};
