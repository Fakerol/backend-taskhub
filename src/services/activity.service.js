import { Activity } from "../models/activity.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";

// Helper function to transform activities to simplified format
const transformActivities = (activities) => {
  return activities.map(activity => ({
    activityId: activity._id,
    username: activity.user.name,
    action: activity.action,
    target: activity.target,
    timestamp: activity.timestamp || activity.createdAt
  }));
};

// Create a new activity record
export const createActivity = async (projectId, userId, action, target) => {
  const activity = await Activity.create({
    project: projectId,
    user: userId,
    action,
    target,
  });

  return await Activity.findById(activity._id)
    .populate("project", "name description")
    .populate("user", "name email");
};

// Get activities for a specific project
export const getProjectActivities = async (projectId, userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    action,
    userId: filterUserId,
    startDate,
    endDate,
    sortBy = "timestamp",
    sortOrder = "desc",
  } = queryParams;

  // Check if user has access to the project
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { members: userId }
    ]
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  // Build query
  const query = {
    project: projectId
  };

  // Add filters
  if (search) {
    query.$and = [
      {
        $or: [
          { action: { $regex: search, $options: "i" } },
          { target: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  if (action) {
    query.action = action;
  }

  if (filterUserId) {
    query.user = filterUserId;
  }

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const activities = await Activity.find(query)
    .populate("user", "name")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("_id action target timestamp createdAt user");

  // Get total count for pagination
  const total = await Activity.countDocuments(query);

  return {
    activities: transformActivities(activities),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Get all activities for a user across all projects
export const getUserActivities = async (userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    action,
    projectId,
    startDate,
    endDate,
    sortBy = "timestamp",
    sortOrder = "desc",
  } = queryParams;

  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  // Build query
  const query = {
    project: { $in: projectIds }
  };

  // Add filters
  if (search) {
    query.$and = [
      {
        $or: [
          { action: { $regex: search, $options: "i" } },
          { target: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  if (action) {
    query.action = action;
  }

  if (projectId) {
    // Verify user has access to this specific project
    const hasAccess = projectIds.some(id => id.toString() === projectId);
    if (!hasAccess) {
      throw new Error("Access denied to this project");
    }
    query.project = projectId;
  }

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const activities = await Activity.find(query)
    .populate("user", "name")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("_id action target timestamp createdAt user");

  // Get total count for pagination
  const total = await Activity.countDocuments(query);

  return {
    activities: transformActivities(activities),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Get a single activity by ID
export const getActivityById = async (activityId, userId) => {
  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const activity = await Activity.findOne({
    _id: activityId,
    project: { $in: projectIds }
  })
    .populate("user", "name")
    .select("_id action target timestamp createdAt user");

  if (!activity) {
    throw new Error("Activity not found or access denied");
  }

  return transformActivities([activity])[0];
};

// Automated activity creation helpers
export const logProjectActivity = async (projectId, userId, action, projectName) => {
  try {
    await createActivity(projectId, userId, action, `project "${projectName}"`);
  } catch (error) {
    console.error("Failed to log project activity:", error);
  }
};

export const logTaskActivity = async (projectId, userId, action, taskTitle) => {
  try {
    await createActivity(projectId, userId, action, `task "${taskTitle}"`);
  } catch (error) {
    console.error("Failed to log task activity:", error);
  }
};

export const logMemberActivity = async (projectId, userId, action, memberName) => {
  try {
    await createActivity(projectId, userId, action, `member "${memberName}"`);
  } catch (error) {
    console.error("Failed to log member activity:", error);
  }
};
