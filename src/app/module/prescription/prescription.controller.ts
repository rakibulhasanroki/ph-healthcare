import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req, res) => {
  const user = req.user!;
  const payload = req.body;
  const result = await PrescriptionService.createPrescription(user, payload);
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const getAllPrescriptions = catchAsync(async (req, res) => {
  const result = await PrescriptionService.getAllPrescriptions();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: result,
  });
});

const getMyPrescriptions = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await PrescriptionService.getMyPrescriptions(user);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Prescriptions retrieved successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user!;
  const { id } = req.params;
  const result = await PrescriptionService.updatePrescription(
    user,
    id as string,
    payload,
  );
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescription = catchAsync(async (req, res) => {
  const user = req.user!;
  const { id } = req.params;
  const result = await PrescriptionService.deletePrescription(
    user,
    id as string,
  );
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Prescription deleted successfully",
    data: result,
  });
});

export const PrescriptionController = {
  createPrescription,
  getAllPrescriptions,
  getMyPrescriptions,
  updatePrescription,
  deletePrescription,
};
