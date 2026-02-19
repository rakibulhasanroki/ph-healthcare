import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateSuperAdminValidationSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email format").optional(),
  profilePhoto: z.url("Invalid URL format").optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
});
