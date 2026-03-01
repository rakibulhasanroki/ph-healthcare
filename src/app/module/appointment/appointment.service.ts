import { uuidv7 } from "zod";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, Role } from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: Express.User,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });
  const doctorScheduleData = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: doctorScheduleData.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    // TODO: payment will be added
    return appointmentData;
  });
  return result;
};
const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true,
      schedule: true,
    },
  });
  return appointments;
};

const getMyAppointments = async (user: Express.User) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  let appointments = [];

  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("User not found");
  }
  return appointments;
};
const getMySingleAppointment = async (
  appointmentId: string,
  user: Express.User,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  let appointment;
  if (patientData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }
  if (!appointment) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }
  return appointment;
};
const changeAppointmentStatus = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: Express.User,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      // status: AppointmentStatus.SCHEDULED,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
  // if (!appointmentData) {
  //   throw new AppError(status.NOT_FOUND, "Appointment not found");
  // }

  if (user?.role === Role.DOCTOR) {
    if (!(user?.email === appointmentData?.doctor?.email)) {
      throw new AppError(status.FORBIDDEN, "This is not your appointment");
    }
  }

  if (user?.role === Role.PATIENT) {
    if (!(user?.email === appointmentData?.patient?.email)) {
      throw new AppError(status.FORBIDDEN, "This is not your appointment");
    }
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: appointmentStatus,
    },
  });
};

export const AppointmentService = {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
};
