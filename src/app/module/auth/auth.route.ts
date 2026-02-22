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

export const AuthRouter = router;
