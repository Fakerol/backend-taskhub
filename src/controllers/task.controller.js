import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  taskQuerySchema,
} from "../dto/task.dto.js";
import {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
} from "../services/task.service.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// Create a new task
export const createTaskController = async (req, res) => {
  try {
    const validated = createTaskSchema.parse(req.body);
    const result = await createTask(validated, req.user.id);
    return successResponse(res, "Task created successfully", result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all tasks for the authenticated user
export const getUserTasksController = async (req, res) => {
  try {
    const validated = taskQuerySchema.parse(req.query);
    const result = await getUserTasks(req.user.id, validated);
    return successResponse(res, "Tasks retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get a single task by ID
export const getTaskByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTaskById(id, req.user.id);
    return successResponse(res, "Task retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Update a task
export const updateTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const validated = updateTaskSchema.parse(req.body);
    const result = await updateTask(id, validated, req.user.id);
    return successResponse(res, "Task updated successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Delete a task
export const deleteTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTask(id, req.user.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Assign task to a user
export const assignTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const validated = assignTaskSchema.parse(req.body);
    const result = await assignTask(id, validated.assignedTo, req.user.id);
    return successResponse(res, "Task assigned successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
