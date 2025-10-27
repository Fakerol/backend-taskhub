import express from "express";
import {
  createTaskController,
  getUserTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  assignTaskController,
} from "../controllers/task.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(generalLimiter);

// Task CRUD routes
router.post("/", createTaskController);
router.get("/", getUserTasksController);
router.get("/:id", getTaskByIdController);
router.put("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

// Task assignment route
router.patch("/:id/assign", assignTaskController);

export default router;
