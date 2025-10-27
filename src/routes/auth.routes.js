import express from "express";
import { signup, login, refreshToken, logout } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refreshToken);
router.post("/logout", authLimiter, logout);

export default router;
