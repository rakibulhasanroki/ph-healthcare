import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";

const router = Router();

router.post(
  "/create-my-doctor-schedule",
  authCheck(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.createMyDoctorScheduleSchema),
  DoctorScheduleController.createMyDoctorSchedule,
);
router.get(
  "/my-doctor-schedule",
  authCheck(Role.DOCTOR),
  DoctorScheduleController.getMyDoctorSchedule,
);

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorScheduleController.getAllDoctorSchedule,
);

router.get(
  "/:doctorId/schedule/:scheduleId",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  DoctorScheduleController.getDoctorScheduleById,
);
router.patch(
  "/update-my-doctor-schedule",
  authCheck(Role.DOCTOR),
  validateRequest(DoctorScheduleValidation.updateMyDoctorScheduleSchema),
  DoctorScheduleController.updateMyDoctorSchedule,
);

router.delete(
  "/delete-my-doctor-schedule/:id",
  authCheck(Role.DOCTOR),
  DoctorScheduleController.deleteMyDoctorSchedule,
);

export const DoctorScheduleRoutes = router;
