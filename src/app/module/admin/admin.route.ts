import express from "express";
import { AdminController } from "./admin.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { updateAdminValidationSchema } from "./admin.validation";

const router = express.Router();

router.get(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAllAdmins,
);

router.get(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  AdminController.getAdminById,
);
router.patch(
  "/:id",
  authCheck(Role.SUPER_ADMIN),
  validateRequest(updateAdminValidationSchema),
  AdminController.updateAdmin,
);
router.delete(
  "/:id",
  authCheck(Role.SUPER_ADMIN),
  AdminController.softDeleteAdmin,
);

router.patch(
  "/change-user-status",
  authCheck(Role.SUPER_ADMIN, Role.ADMIN),
  AdminController.changeUserStatus,
);
router.patch(
  "/change-user-role",
  authCheck(Role.SUPER_ADMIN),
  AdminController.changeUserRole,
);

export const AdminRoutes = router;
