import { Gender } from "../../../generated/prisma/enums";

export interface IDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender;
    appointmentFee: number;
    qualifications: string;
    currentWorkingPlace: string;
    designations: string;
  };
  specialtyIds: string[];
}
