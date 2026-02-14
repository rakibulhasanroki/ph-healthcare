import { Router } from "express";
import { SpecialtyRouter } from "../module/specialty.route";

const router = Router();

router.use("/specialties", SpecialtyRouter);

export const IndexRouter = router;
