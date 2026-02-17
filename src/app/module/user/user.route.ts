import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-doctor",
  validateRequest(UserValidation.createDoctorSchema),
  UserController.createDoctor,
);

router.post(
  "/create-admin",
  authCheck(Role.SUPER_ADMIN),
  validateRequest(UserValidation.createAdminSchema),
  UserController.createAdmin,
);

router.post(
  "/create-super-admin",
  authCheck(Role.SUPER_ADMIN),
  validateRequest(UserValidation.createSuperAdminSchema),
  UserController.createSuperAdmin,
);

export const UserRoutes = router;
