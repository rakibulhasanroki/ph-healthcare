import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const createDoctorSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
  doctor: z.object({
    name: z
      .string("Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string("Contact number is required")
      .min(11, "Contact number must be at least 10 digits")
      .max(14, "Contact number must be less than 15 digits"),
    address: z
      .string("Address is required")
      .min(5, "Address must be at least 5 characters")
      .max(100, "Address must be less than 100 characters")
      .optional(),
    registrationNumber: z.string("Registration number is required"),
    experience: z
      .int("Experience must be a number")
      .nonnegative("Experience cannot be negative")
      .optional(),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE],
      "Gender must be either MALE or FEMALE",
    ),
    appointmentFee: z
      .number("Appointment fee must be a number")
      .nonnegative("Appointment fee cannot be negative"),
    qualifications: z
      .string("Qualification is required")
      .min(2, "Qualification must be at least 2 characters")
      .max(50, "Qualification must be less than 50 characters"),

    currentWorkingPlace: z
      .string("Current working place is required")
      .min(2, "Current working place must be at least 2 characters")
      .max(50, "Current working place must be less than 50 characters"),
    designations: z
      .string("Designation is required")
      .min(2, "Designation must be at least 2 characters")
      .max(50, "Designation must be less than 50 characters"),
  }),
  specialtyIds: z
    .array(z.uuid(), "Specialties must be an array of UUIDs")
    .min(1, "At least one specialty is required"),
});
