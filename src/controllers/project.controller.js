import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  removeMemberSchema,
  projectQuerySchema,
} from "../dto/project.dto.js";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
} from "../services/project.service.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

// Create a new project
export const createProjectController = async (req, res) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const result = await createProject(validated, req.user.id);
    return successResponse(res, "Project created successfully", result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get all projects for the authenticated user
export const getUserProjectsController = async (req, res) => {
  try {
    const validated = projectQuerySchema.parse(req.query);
    const result = await getUserProjects(req.user.id, validated);
    return successResponse(res, "Projects retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Get a single project by ID
export const getProjectByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProjectById(id, req.user.id);
    return successResponse(res, "Project retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

// Update a project
export const updateProjectController = async (req, res) => {
  try {
    const { id } = req.params;
    const validated = updateProjectSchema.parse(req.body);
    const result = await updateProject(id, validated, req.user.id);
    return successResponse(res, "Project updated successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Delete a project
export const deleteProjectController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProject(id, req.user.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Add member to project
export const addMemberController = async (req, res) => {
  try {
    const { id } = req.params;
    const validated = addMemberSchema.parse(req.body);
    const result = await addMemberToProject(id, validated.email, req.user.id);
    return successResponse(res, "Member added successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// Remove member from project
export const removeMemberController = async (req, res) => {
  try {
    const { id } = req.params;
    const validated = removeMemberSchema.parse(req.body);
    const result = await removeMemberFromProject(id, validated.userId, req.user.id);
    return successResponse(res, "Member removed successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
