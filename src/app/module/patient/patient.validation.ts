import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePatientProfileSchema = z.object({
  patientInfo: z
    .object({
      name: z
        .string("Name Must be a string")
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .optional(),
      profilePhoto: z.url("Invalid URL format").optional(),
      contactNumber: z
        .string("Contact number must be a string")
        .min(10, "Contact number must be at least 10 characters")
        .max(15, "Contact number must be less than 15 characters")
        .optional(),
      address: z
        .string("Address must be a string")
        .min(2, "Address must be at least 2 characters")
        .max(200, "Address must be less than 50 characters")
        .optional(),
    })
    .optional(),
  patientHealthData: z
    .object({
      gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
      dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid date format",
        })
        .optional(),
      bloodGroup: z
        .enum([
          BloodGroup.A_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.AB_NEGATIVE,
          BloodGroup.O_POSITIVE,
          BloodGroup.O_NEGATIVE,
        ])
        .optional(),
      hasAllergies: z.boolean().optional(),
      hasDiabetes: z.boolean().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      smokingStatus: z.boolean().optional(),
      dietaryPreferences: z.string().optional(),
      pregnancyStatus: z.boolean().optional(),
      mentalHealthHistory: z.string().optional(),
      immunizationStatus: z.string().optional(),
      hasPastSurgeries: z.boolean().optional(),
      recentAnxiety: z.boolean().optional(),
      recentDepression: z.boolean().optional(),
      maritalStatus: z.string().optional(),
    })
    .optional(),
  medicalReports: z
    .array(
      z.object({
        reportName: z.string().optional(),
        reportLink: z.url("Invalid URL format").optional(),
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional(),
      }),
    )
    .optional()
    .refine(
      (reports) => {
        if (!reports || reports.length === 0) return true;
        for (const report of reports) {
          if (report.shouldDelete && !report.reportId) {
            return false;
          }
          if (report.reportId && !report.shouldDelete) {
            return false;
          }
          if (report.reportName && !report.reportLink) {
            return false;
          }
          if (report.reportLink && !report.reportName) {
            return false;
          }
          return true;
        }
      },
      {
        message:
          "Invalid medical report format. If shouldDelete is true, reportId must be provided. if ReportId is provided, shouldDelete must be true. If reportName is provided, reportLink must be provided. If reportLink is provided, reportName must be provided.",
      },
    ),
});

export const PatientValidation = {
  updatePatientProfileSchema,
};
