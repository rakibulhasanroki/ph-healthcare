import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { ScheduleController } from "./schedule.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  ScheduleController.getAllSchedules,
);
router.get(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  ScheduleController.getScheduleById,
);

router.post(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(ScheduleValidation.createScheduleSchema),
  ScheduleController.createSchedule,
);

router.patch(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(ScheduleValidation.updateScheduleSchema),
  ScheduleController.updateSchedule,
);
router.delete(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  ScheduleController.deleteSchedule,
);

export const ScheduleRoutes = router;
