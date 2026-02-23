import { Router } from "express";
import { AuthController } from "./auth.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/me",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  AuthController.getMe,
);
router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  authCheck(Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN, Role.ADMIN),
  AuthController.changePassword,
);
router.post(
  "/logout",
  authCheck(Role.PATIENT, Role.DOCTOR, Role.SUPER_ADMIN, Role.ADMIN),
  AuthController.logout,
);

router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
export const AuthRouter = router;
