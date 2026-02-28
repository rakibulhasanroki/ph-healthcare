import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createMyDoctorSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user!;
  const result = await DoctorScheduleService.createMyDoctorSchedule(
    user,
    payload,
  );
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllDoctorSchedule = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await DoctorScheduleService.getAllDoctorSchedule(
    query as IQueryParams,
  );
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user!;
  const query = req.query;
  const result = await DoctorScheduleService.getMyDoctorSchedule(
    user,
    query as IQueryParams,
  );
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getDoctorScheduleById = catchAsync(async (req, res) => {
  const { doctorId, scheduleId } = req.params;
  const result = await DoctorScheduleService.getDoctorScheduleById(
    doctorId as string,
    scheduleId as string,
  );
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

const updateMyDoctorSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user!;

  const result = await DoctorScheduleService.updateMyDoctorSchedule(
    user,
    payload,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

const deleteMyDoctorSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user!;
  const result = await DoctorScheduleService.deleteMyDoctorSchedule(
    id as string,
    user,
  );
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
