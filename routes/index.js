import { Router } from "express";
import authRoutes from "./auth.js";
import habitRoutes from "./habits.js";
import logRoutes from "./logs.js";
import aiRoutes from "./ai.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/habits", habitRoutes);
router.use("/logs", logRoutes);
router.use("/ai", aiRoutes);

export default router;
