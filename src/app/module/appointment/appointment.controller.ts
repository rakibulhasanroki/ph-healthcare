import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req, res) => {
  const result = await AppointmentService.bookAppointment();
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Appointment created successfully",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req, res) => {
  const result = await AppointmentService.getAllAppointments();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const getMyAppointments = catchAsync(async (req, res) => {
  const result = await AppointmentService.getMyAppointments();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const getMySingleAppointment = catchAsync(async (req, res) => {
  const result = await AppointmentService.getMySingleAppointment();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const changeAppointmentStatus = catchAsync(async (req, res) => {
  const result = await AppointmentService.changeAppointmentStatus();
  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

export const AppointmentController = {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
};
