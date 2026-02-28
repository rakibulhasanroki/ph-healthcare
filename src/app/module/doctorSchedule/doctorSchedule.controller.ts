import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createMyDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.createMyDoctorSchedule();
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.getAllDoctorSchedule();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result,
  });
});

const getMyDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.getMyDoctorSchedule();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

const getDoctorScheduleById = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.getDoctorScheduleById();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

const updateMyDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.updateMyDoctorSchedule();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

const deleteMyDoctorSchedule = catchAsync(async (req, res) => {
  const result = await DoctorScheduleService.deleteMyDoctorSchedule();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const DoctorScheduleController = {
  createMyDoctorSchedule,
  getAllDoctorSchedule,
  getMyDoctorSchedule,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
