/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import {
  ICreatePrescriptionPayload,
  IUpdatePrescriptionPayload,
} from "./prescription.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../generated/prisma/enums";
import { generatePrescriptionPDF } from "./prescription.utils";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../config/cloudinary.config";

import { sendEmail } from "../../utils/email";

const createPrescription = async (
  user: Express.User,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: true,
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });
  if (appointmentData.doctorId !== doctorData.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only create prescription for your own appointment",
    );
  }
  const isAlreadyPrescribed = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });
  if (isAlreadyPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already prescribed for this appointment.You can update it.",
    );
  }

  const followUpDate = new Date(payload.followUpDate);
  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.prescription.create({
      data: {
        ...payload,
        followUpDate,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
      },
    });

    const pdfBuffer = await generatePrescriptionPDF({
      doctorName: doctorData.name,
      doctorEmail: doctorData.email,
      patientName: appointmentData.patient.name,
      patientEmail: appointmentData.patient.email,
      followUpDate,
      instructions: payload.instructions,
      prescriptionId: result.id,
      appointmentDate: appointmentData.schedule.startDateTime,
      createdAt: new Date(),
    });

    const fileName = `prescription-${Date.now()}.pdf`;
    const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
    const pdfUrl = uploadedFile.secure_url;
    const updatedPrescription = await tx.prescription.update({
      where: {
        id: result.id,
      },
      data: {
        pdfUrl,
      },
    });

    try {
      const patient = appointmentData.patient;
      const doctor = appointmentData.doctor;
      await sendEmail({
        to: patient.email,
        subject: `You have received a prescription from ${doctor.name}`,
        templateName: "prescription",
        templateData: {
          patientName: appointmentData.patient.name,
          doctorName: doctorData.name,
          appointmentDate: new Date(appointmentData.schedule.startDateTime),
          followUpDate,
          instructions: payload.instructions,
          pdfUrl,
        },
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error: any) {
      console.log(
        "Failed to send email notification for prescription",
        error.message,
      );
    }

    return updatedPrescription;
  });

  return result;
};
const getMyPrescriptions = async (user: Express.User) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (isUserExist.role === Role.DOCTOR) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctor: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        appointment: true,
        doctor: true,
      },
    });
    return prescriptions;
  }

  if (isUserExist.role === Role.PATIENT) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: {
          email: user.email,
        },
      },
      include: {
        patient: true,
        appointment: true,
        doctor: true,
      },
    });
    return prescriptions;
  }
};

const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      appointment: true,
      doctor: true,
    },
  });
  return result;
};

const updatePrescription = async (
  user: Express.User,
  prescriptionId: string,
  payload: IUpdatePrescriptionPayload,
): Promise<any> => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
      doctor: true,
    },
  });
  if (user?.email !== prescriptionData.doctor.email) {
    throw new AppError(
      status.FORBIDDEN,
      "This is not your prescription. You can only update your own prescription",
    );
  }
  const updatedInstructions =
    payload.instructions || prescriptionData.instructions;
  const updatedFollowUpDate = payload.followUpDate
    ? new Date(payload.followUpDate)
    : prescriptionData.followUpDate;
  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptionData.doctor.name,
    doctorEmail: prescriptionData.doctor.email,
    patientName: prescriptionData.patient.name,
    patientEmail: prescriptionData.patient.email,
    followUpDate: updatedFollowUpDate,
    instructions: updatedInstructions,
    prescriptionId: prescriptionData.id,
    appointmentDate: prescriptionData.appointment.schedule.startDateTime,
    createdAt: prescriptionData.createdAt,
  });

  const fileName = `prescription-updated-${Date.now()}.pdf`;
  const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
  const newPdfUrl = uploadedFile.secure_url;
  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError: any) {
      console.log("Failed to delete file from cloudinary", deleteError);
    }
  }
  const result = await prisma.prescription.update({
    where: {
      id: prescriptionId,
    },
    data: {
      followUpDate: updatedFollowUpDate,
      instructions: updatedInstructions,
      pdfUrl: newPdfUrl,
    },
    include: {
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
      doctor: true,
    },
  });
  try {
    await sendEmail({
      to: result.patient.email,
      subject: `Your prescription has been updated by Dr. ${result.doctor.name}`,
      templateName: "prescription",
      templateData: {
        patientName: result.patient.name,
        doctorName: result.doctor.name,
        appointmentDate: new Date(result.appointment.schedule.startDateTime),
        followUpDate: new Date(result.followUpDate).toLocaleDateString,
        instructions: result.instructions,
        pdfUrl: newPdfUrl,
      },
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error: any) {
    console.error("Failed to send email", error);
  }
  return result;
};

const deletePrescription = async (
  user: Express.User,
  prescriptionId: string,
): Promise<void> => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const prescriptionData = await prisma.prescription.findUniqueOrThrow({
    where: {
      id: prescriptionId,
    },
    include: {
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
      doctor: true,
    },
  });
  if (user?.email !== prescriptionData.doctor.email) {
    throw new AppError(
      status.FORBIDDEN,
      "This is not your prescription. You can only delete your own prescription",
    );
  }
  if (prescriptionData.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptionData.pdfUrl);
    } catch (deleteError) {
      console.log("Failed to delete file from cloudinary", deleteError);
    }
  }
  await prisma.prescription.delete({
    where: {
      id: prescriptionId,
    },
  });
};

export const PrescriptionService = {
  createPrescription,
  getAllPrescriptions,
  getMyPrescriptions,
  deletePrescription,
  updatePrescription,
};
