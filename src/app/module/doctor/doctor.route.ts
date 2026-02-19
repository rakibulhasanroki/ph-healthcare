import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorValidation } from "./doctor.validation";

const router = Router();

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorController.getAllDoctors,
);
router.get(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorController.getDoctorById,
);

router.patch(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(DoctorValidation.updateDoctorValidationSchema),
  DoctorController.updateDoctor,
);

router.delete(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorController.softDeleteDoctor,
);

export const DoctorRoutes = router;
