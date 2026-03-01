import { z } from "zod";

const createMyDoctorScheduleSchema = z.object({
  scheduleIds: z
    .array(z.string().uuid({ message: "Each scheduleId must be a valid UUID" }))
    .min(1, { message: "At least one scheduleId is required" }),
});

const updateMyDoctorScheduleSchema = z.object({
  scheduleIds: z
    .array(
      z.object({
        id: z.string().uuid("Schedule id must be a valid UUID"),
        shouldDelete: z.boolean().refine((val) => typeof val === "boolean", {
          message: "shouldDelete must be a boolean value",
        }),
      }),
    )
    .min(1, "At least one schedule operation is required"),
});

export const DoctorScheduleValidation = {
  createMyDoctorScheduleSchema,
  updateMyDoctorScheduleSchema,
};
