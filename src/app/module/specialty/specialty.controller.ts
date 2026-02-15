import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SpecialtyService } from "./specialty.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await SpecialtyService.createSpecialty(payload);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtyService.getSpecialties();

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Specialties retrieved successfully",
    data: result,
  });
});

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await SpecialtyService.updateSpecialty(id as string, payload);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Specialty updated successfully",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtyService.deleteSpecialty(id as string);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getSpecialties,
  deleteSpecialty,
  updateSpecialty,
};
