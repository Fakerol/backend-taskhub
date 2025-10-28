import { z } from "zod";

// Create activity validation schema (for manual creation if needed)
export const createActivitySchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  action: z.string().min(1, "Action is required").max(100, "Action must be less than 100 characters"),
  target: z.string().min(1, "Target is required").max(200, "Target must be less than 200 characters"),
});

// Activity query parameters validation schema
export const activityQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["timestamp", "action", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
