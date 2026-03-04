import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { PatientController } from "./patient.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { PatientValidation } from "./patient.validation";
import { multerConfig } from "../../config/multer.config";
import { Router } from "express";
import { updatePatientProfileMiddleware } from "./patient.middleware";

const router = Router();

router.patch(
  "/update-my-profile",
  authCheck(Role.PATIENT),
  multerConfig.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  updatePatientProfileMiddleware,
  validateRequest(PatientValidation.updatePatientProfileSchema),
  PatientController.updateMyProfile,
);

export const PatientRoutes = router;
