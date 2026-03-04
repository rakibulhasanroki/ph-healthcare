import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { PatientService } from "./patient.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const payload = req.body;

  const result = await PatientService.updateMyProfile(user, payload);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};
