import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  PrescriptionController.getAllPrescriptions,
);

router.get(
  "/my-prescriptions",
  authCheck(Role.PATIENT, Role.DOCTOR),
  PrescriptionController.getMyPrescriptions,
);

router.post(
  "/",
  authCheck(Role.DOCTOR),
  PrescriptionController.createPrescription,
);

router.patch(
  "/:id",
  authCheck(Role.DOCTOR),
  PrescriptionController.updatePrescription,
);

router.delete(
  "/:id",
  authCheck(Role.DOCTOR),
  PrescriptionController.deletePrescription,
);

export const PrescriptionRoutes = router;
