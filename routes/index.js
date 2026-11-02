import { Router } from "express";
import authRoutes from "./auth.js";
import habitRoutes from "./habits.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/habits", habitRoutes);

export default router;
