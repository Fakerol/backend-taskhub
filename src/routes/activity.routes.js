import express from "express";
import {
  getProjectActivitiesController,
  getUserActivitiesController,
  getActivityByIdController,
  createActivityController,
} from "../controllers/activity.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(generalLimiter);

// Activity routes
router.get("/project/:projectId", getProjectActivitiesController);
router.get("/user", getUserActivitiesController);
router.get("/:id", getActivityByIdController);
router.post("/", createActivityController);

export default router;
