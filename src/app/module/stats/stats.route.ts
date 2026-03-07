import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import authCheck from "../../middleware/authCheck";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  StatsController.getStats,
);

export const StatsRoutes = router;
