import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-doctor",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UserValidation.createDoctorSchema),
  UserController.createDoctor,
);

router.post(
  "/create-admin",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UserValidation.createAdminSchema),
  UserController.createAdmin,
);

export const UserRoutes = router;
