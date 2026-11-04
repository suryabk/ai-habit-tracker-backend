import { Router } from "express";
import authRoutes from "./auth.js";
import habitRoutes from "./habits.js";
import logRoutes from "./logs.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/habits", habitRoutes);
router.use("/logs", logRoutes);

export default router;
