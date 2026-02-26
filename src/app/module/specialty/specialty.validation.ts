import z from "zod";

const createSpecialtySchema = z.object({
  title: z
    .string("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(50, "Title must be less than 50 characters"),
  description: z.string().optional(),
});

export const SpecialtyValidation = {
  createSpecialtySchema,
};
