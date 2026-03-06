import z from "zod";

const createPrescriptionSchema = z.object({
  appointmentId: z.string().uuid("Appointment ID must be a valid UUID"),
  instructions: z
    .string("Instructions are required")
    .min(2, "Instructions must be at least 2 characters"),
  followUpDate: z.string("Follow-up date must be a valid date").optional(),
});

const updatePrescriptionSchema = z.object({
  instructions: z
    .string("Instructions are required")
    .min(2, "Instructions must be at least 2 characters")
    .optional(),
  followUpDate: z.string("Follow-up date must be a valid date").optional(),
});

export const PrescriptionValidation = {
  createPrescriptionSchema,
  updatePrescriptionSchema,
};
