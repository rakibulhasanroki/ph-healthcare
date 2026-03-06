import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { Role } from "../../../generated/prisma/enums";

import { ReviewController } from "./review.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.get("/", ReviewController.getAllReviews);

router.post(
  "/",
  authCheck(Role.PATIENT),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview,
);

router.get(
  "/my-reviews",
  authCheck(Role.PATIENT, Role.DOCTOR),
  ReviewController.getMyReviews,
);

router.patch(
  "/:id",
  authCheck(Role.PATIENT),
  validateRequest(ReviewValidation.updateReviewSchema),
  ReviewController.updateReview,
);

router.delete("/:id", authCheck(Role.PATIENT), ReviewController.deleteReview);

export const ReviewRoutes = router;
