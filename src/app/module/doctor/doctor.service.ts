import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctor } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllDoctors = async () => {
  const result = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      user: true,
      doctorSpecialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
  return result;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      doctorSpecialties: {
        include: {
          specialty: true,
        },
      },
      appointments: {
        include: {
          patient: true,
          schedule: true,
          prescription: true,
        },
      },

      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Transform specialties to flatten structure
  return {
    ...doctor,
    specialties: doctor.doctorSpecialties.map((s) => s.specialty),
  };
};

const updateDoctor = async (id: string, payload: IUpdateDoctor) => {
  // Check if doctor exists and not deleted
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!existingDoctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  // Separate specialties from doctor data
  const { doctor: doctorData, specialties } = payload;

  await prisma.$transaction(async (tx) => {
    if (doctorData) {
      await tx.doctor.update({
        where: {
          id,
        },
        data: {
          ...doctorData,
        },
      });
    }
    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {
        const { specialtyId, shouldDelete } = specialty;
        if (shouldDelete) {
          await tx.doctorSpecialty.delete({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              },
            },
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              },
            },
            create: {
              doctorId: id,
              specialtyId,
            },
            update: {},
          });
        }
      }
    }
  });
  const doctor = await getDoctorById(id);
  return doctor;
};

const softDeleteDoctor = async (id: string) => {
  // Check if doctor exists and not already deleted
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: {
        id: doctor.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: doctor.userId,
      },
    });
    await tx.doctorSpecialty.deleteMany({
      where: {
        doctorId: id,
      },
    });
  });

  return { message: "Doctor deleted successfully" };
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
