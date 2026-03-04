import z from "zod";

const createReviewSchema = z.object({
  appointmentId: z.string("Appointment ID is required"),
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string("Comment is required")
    .min(2, "Comment must be at least 2 characters")
    .max(100, "Comment must be at most 100 characters"),
});

const updateReviewSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string("Comment is required")
    .min(2, "Comment must be at least 2 characters")
    .max(100, "Comment must be at most 100 characters"),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
};
