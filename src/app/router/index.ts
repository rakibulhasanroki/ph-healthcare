import { Router } from "express";
import { SpecialtyRouter } from "../module/specialty/specialty.route";
import { AuthRouter } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);

export const IndexRouter = router;
