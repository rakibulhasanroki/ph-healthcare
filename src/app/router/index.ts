import { Router } from "express";
import { SpecialtyRouter } from "../module/specialty/specialty.route";
import { AuthRouter } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);
router.use("/users", UserRoutes);
router.use("/doctors", DoctorRoutes);

export const IndexRouter = router;
