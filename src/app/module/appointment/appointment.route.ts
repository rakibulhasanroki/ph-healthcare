import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";

const router = Router();

router.post(
  "/books-appointment",
  authCheck(Role.PATIENT),
  AppointmentController.bookAppointment,
);

router.get(
  "/all-appointments",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.getAllAppointments,
);

router.get(
  "/my-appointments",
  authCheck(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMyAppointments,
);

router.get(
  "/my-single-appointment/:id",
  authCheck(Role.PATIENT, Role.DOCTOR),
  AppointmentController.getMySingleAppointment,
);
router.patch(
  "/change-appointment-status/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  AppointmentController.changeAppointmentStatus,
);

export const AppointmentRoutes = router;
