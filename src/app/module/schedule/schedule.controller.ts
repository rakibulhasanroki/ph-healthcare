import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await ScheduleService.createSchedule(payload);
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ScheduleService.getAllSchedules(query as IQueryParams);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result,
  });
});

const getScheduleById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ScheduleService.getScheduleById(id as string);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

const updateSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await ScheduleService.updateSchedule(id as string, payload);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteSchedule(id as string);
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
