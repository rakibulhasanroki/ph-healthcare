import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";
import { multerConfig } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.post(
  "/",
  // authCheck(Role.ADMIN, Role.SUPER_ADMIN),
  multerConfig.single("image"),
  validateRequest(SpecialtyValidation.createSpecialtySchema),
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
