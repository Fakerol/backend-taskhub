import {
  createActivitySchema,
  activityQuerySchema,
} from "../dto/activity.dto.js";
import {
  createActivity,
  getProjectActivities,
  getUserActivities,
  getActivityById,
} from "../services/activity.service.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// Get activities for a specific project
export const getProjectActivitiesController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const validated = activityQuerySchema.parse(req.query);
    const result = await getProjectActivities(projectId, req.user.id, validated);
    return successResponse(res, "Project activities retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all activities for the authenticated user
export const getUserActivitiesController = async (req, res) => {
  try {
    const validated = activityQuerySchema.parse(req.query);
    const result = await getUserActivities(req.user.id, validated);
    return successResponse(res, "User activities retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get a single activity by ID
export const getActivityByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getActivityById(id, req.user.id);
    return successResponse(res, "Activity retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Create a new activity (manual creation if needed)
export const createActivityController = async (req, res) => {
  try {
    const validated = createActivitySchema.parse(req.body);
    const result = await createActivity(
      validated.projectId,
      req.user.id,
      validated.action,
      validated.target
    );
    return successResponse(res, "Activity created successfully", result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
