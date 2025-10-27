import express from "express";
import {
  createProjectController,
  getUserProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
  addMemberController,
  removeMemberController,
} from "../controllers/project.controller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(generalLimiter);

// Project CRUD routes
router.post("/", createProjectController);
router.get("/", getUserProjectsController);
router.get("/:id", getProjectByIdController);
router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

// Project member management routes
router.post("/:id/members", addMemberController);
router.delete("/:id/members", removeMemberController);

export default router;
