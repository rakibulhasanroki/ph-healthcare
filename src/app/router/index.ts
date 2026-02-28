import { Router } from "express";
import { SpecialtyRouter } from "../module/specialty/specialty.route";
import { AuthRouter } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { UserRoutes } from "../module/user/user.route";
import { AdminRoutes } from "../module/admin/admin.route";
import { ScheduleRoutes } from "../module/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.router";
import { AppointmentRoutes } from "../module/appointment/appointment.route";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/specialties", SpecialtyRouter);
router.use("/users", UserRoutes);
router.use("/doctors", DoctorRoutes);
router.use("/admins", AdminRoutes);
router.use("/schedule", ScheduleRoutes);
router.use("/doctorSchedule", DoctorScheduleRoutes);
router.use("/appointment", AppointmentRoutes);

export const IndexRouter = router;
