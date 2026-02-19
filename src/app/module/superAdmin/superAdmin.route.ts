import express from "express";
import { SuperAdminController } from "./superAdmin.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/",
  authCheck(Role.SUPER_ADMIN),
  SuperAdminController.getAllSuperAdmins,
);

router.get(
  "/:id",
  authCheck(Role.SUPER_ADMIN),
  SuperAdminController.getSuperAdminById,
);

router.patch(
  "/:id",
  authCheck(Role.SUPER_ADMIN),
  SuperAdminController.updateSuperAdmin,
);

router.delete(
  "/:id",
  authCheck(Role.SUPER_ADMIN),
  SuperAdminController.softDeleteSuperAdmin,
);

export const SuperAdminRoutes = router;
