import { z } from "zod";

// Create project validation schema
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

// Update project validation schema
export const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

// Add member to project validation schema
export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Remove member from project validation schema
export const removeMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Project query parameters validation schema
export const projectQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
