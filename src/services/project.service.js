import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { logProjectActivity, logMemberActivity } from "./activity.service.js";

// Create a new project
export const createProject = async (projectData, userId) => {
  const project = await Project.create({
    ...projectData,
    owner: userId,
    members: [userId], // Owner is automatically a member
  });

  const populatedProject = await Project.findById(project._id)
    .populate("owner", "name email")
    .populate("members", "name email");

  // Log activity
  await logProjectActivity(project._id, userId, "created", projectData.name);

  return populatedProject;
};

// Get all projects for a user (owned or member)
export const getUserProjects = async (userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  // Build query
  const query = {
    $or: [
      { owner: userId },
      { members: userId }
    ]
  };

  // Add search functionality
  if (search) {
    query.$and = [
      {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const projects = await Project.find(query)
    .populate("owner", "name email")
    .populate("members", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Project.countDocuments(query);

  return {
    projects,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Get a single project by ID
export const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { members: userId }
    ]
  })
    .populate("owner", "name email")
    .populate("members", "name email");

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
};

// Update a project
export const updateProject = async (projectId, updateData, userId) => {
  // Check if user is the owner
  const project = await Project.findOne({
    _id: projectId,
    owner: userId
  });

  if (!project) {
    throw new Error("Project not found or you don't have permission to update it");
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("owner", "name email")
    .populate("members", "name email");

  // Log activity
  await logProjectActivity(projectId, userId, "updated", project.name);

  return updatedProject;
};

// Delete a project
export const deleteProject = async (projectId, userId) => {
  // Check if user is the owner
  const project = await Project.findOne({
    _id: projectId,
    owner: userId
  });

  if (!project) {
    throw new Error("Project not found or you don't have permission to delete it");
  }

  // Log activity before deletion
  await logProjectActivity(projectId, userId, "deleted", project.name);

  await Project.findByIdAndDelete(projectId);
  return { message: "Project deleted successfully" };
};

// Add member to project
export const addMemberToProject = async (projectId, email, userId) => {
  // Check if user is the owner
  const project = await Project.findOne({
    _id: projectId,
    owner: userId
  });

  if (!project) {
    throw new Error("Project not found or you don't have permission to add members");
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new Error("User not found");
  }

  // Check if user is already a member
  if (project.members.includes(userToAdd._id)) {
    throw new Error("User is already a member of this project");
  }

  // Add user to members array
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: userToAdd._id } },
    { new: true, runValidators: true }
  )
    .populate("owner", "name email")
    .populate("members", "name email");

  // Log activity
  await logMemberActivity(projectId, userId, "added", userToAdd.name);

  return updatedProject;
};

// Remove member from project
export const removeMemberFromProject = async (projectId, memberId, userId) => {
  // Check if user is the owner
  const project = await Project.findOne({
    _id: projectId,
    owner: userId
  });

  if (!project) {
    throw new Error("Project not found or you don't have permission to remove members");
  }

  // Check if trying to remove the owner
  if (project.owner.toString() === memberId) {
    throw new Error("Cannot remove the project owner");
  }

  // Get member details for logging
  const memberToRemove = await User.findById(memberId);

  // Remove user from members array
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: memberId } },
    { new: true, runValidators: true }
  )
    .populate("owner", "name email")
    .populate("members", "name email");

  // Log activity
  await logMemberActivity(projectId, userId, "removed", memberToRemove.name);

  return updatedProject;
};

// Check if user has access to project
export const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { members: userId }
    ]
  });

  return !!project;
};

// Check if user is project owner
export const checkProjectOwnership = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    owner: userId
  });

  return !!project;
};
