import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
  "name",
  "email",
  "qualifications",
  "registrationNumber",
  "currentWorkingPlace",
  "designations",
  "doctorSpecialties.specialty.title",
  "address",
  "contactNumber",
];
export const doctorFilterableFields = [
  "gender",
  "isDeleted",
  "appointmentFee",
  "experience",
  "registrationNumber",
  "currentWorkingPlace",
  "designations",
  "doctorSpecialties.specialtyId",
  "qualification",
  "title",
  "user.role",
];

export const doctorIncludeConfig: Partial<
  Record<
    keyof Prisma.DoctorInclude,
    Prisma.DoctorInclude[keyof Prisma.DoctorInclude]
  >
> = {
  user: true,
  doctorSpecialties: {
    include: {
      specialty: true,
    },
  },
  appointments: {
    include: {
      patient: true,
      doctor: true,
      prescription: true,
    },
  },
  doctorSchedules: {
    include: {
      schedule: true,
    },
  },
  prescriptions: true,
  reviews: true,
};
