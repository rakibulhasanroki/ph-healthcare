import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  SpecialtyController.createSpecialty,
);
router.get("/", SpecialtyController.getSpecialties);
router.patch(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  SpecialtyController.updateSpecialty,
);
router.delete(
  "/:id",
  authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  SpecialtyController.deleteSpecialty,
);

export const SpecialtyRouter = router;
