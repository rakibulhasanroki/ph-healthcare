import { uuidv7 } from "zod";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import {
  AppointmentStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../config/stripe.config";
import { env } from "../../config/env";

// book appointment with pay now
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

  const result = await prisma.$transaction(async (tx) => {
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
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 122,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${env.FRONTEND_URL}/dashboard/payment/success`,
      // cancel_url: `${env.FRONTEND_URL}/dashboard/payment/cancel`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/appointment`,
    });
    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  });
  return {
    appointment: result.appointmentData,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };
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

// bookAppointment with pay later

const bookAppointmentWithPayLater = async (
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

  const result = await prisma.$transaction(async (tx) => {
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
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        amount: doctorData.appointmentFee,
        transactionId,
        appointmentId: appointmentData.id,
      },
    });

    return { appointment: appointmentData, payment: paymentData };
  });

  return result;
};

const initiatePayment = async (appointmentId: string, user: Express.User) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    },
  });
  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "Payment already done");
  }
  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(status.BAD_REQUEST, "Appointment already canceled");
  }
  if (!appointmentData.payment) {
    throw new AppError(status.BAD_REQUEST, "Payment not found");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with ${appointmentData.doctor.name}`,
          },
          unit_amount: Math.round(
            Number(appointmentData.doctor.appointmentFee) * 122,
          ),
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment.id,
    },
    success_url: `${env.FRONTEND_URL}/dashboard/payment/success`,

    cancel_url: `${env.FRONTEND_URL}/dashboard/appointment`,
  });
  return {
    paymentUrl: session.url,
  };
};

export const AppointmentService = {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  getMySingleAppointment,
  changeAppointmentStatus,
  bookAppointmentWithPayLater,
  initiatePayment,
};
