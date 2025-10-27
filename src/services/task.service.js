import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";

// Create a new task
export const createTask = async (taskData, userId) => {
  const { projectId, ...taskFields } = taskData;

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

  // Validate assignedTo user if provided
  if (taskFields.assignedTo) {
    const assignedUser = await User.findById(taskFields.assignedTo);
    if (!assignedUser) {
      throw new Error("Assigned user not found");
    }

    // Check if assigned user is a member of the project
    const isMember = project.members.some(member => member.toString() === taskFields.assignedTo);
    if (!isMember) {
      throw new Error("Assigned user is not a member of this project");
    }
  }

  // Convert dueDate string to Date if provided
  if (taskFields.dueDate) {
    taskFields.dueDate = new Date(taskFields.dueDate);
  }

  const task = await Task.create({
    ...taskFields,
    project: projectId,
    createdBy: userId,
  });

  return await Task.findById(task._id)
    .populate("project", "name description")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
};

// Get all tasks for a user (based on project access)
export const getUserTasks = async (userId, queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    priority,
    assignedTo,
    projectId,
    sortBy = "createdAt",
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
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      }
    ];
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (projectId) {
    // Verify user has access to this specific project
    const hasAccess = projectIds.some(id => id.toString() === projectId);
    if (!hasAccess) {
      throw new Error("Access denied to this project");
    }
    query.project = projectId;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const tasks = await Task.find(query)
    .populate("project", "name description")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Task.countDocuments(query);

  return {
    tasks,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

// Get a single task by ID
export const getTaskById = async (taskId, userId) => {
  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const task = await Task.findOne({
    _id: taskId,
    project: { $in: projectIds }
  })
    .populate("project", "name description")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!task) {
    throw new Error("Task not found or access denied");
  }

  return task;
};

// Update a task
export const updateTask = async (taskId, updateData, userId) => {
  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const task = await Task.findOne({
    _id: taskId,
    project: { $in: projectIds }
  });

  if (!task) {
    throw new Error("Task not found or access denied");
  }

  // Check permissions: Only task creator, project owner, or assigned user can update
  const canUpdate = 
    task.createdBy.toString() === userId ||
    task.assignedTo?.toString() === userId ||
    await Project.findOne({ _id: task.project, owner: userId });

  if (!canUpdate) {
    throw new Error("You don't have permission to update this task");
  }

  // Validate assignedTo user if provided
  if (updateData.assignedTo) {
    const assignedUser = await User.findById(updateData.assignedTo);
    if (!assignedUser) {
      throw new Error("Assigned user not found");
    }

    // Check if assigned user is a member of the project
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => member.toString() === updateData.assignedTo);
    if (!isMember) {
      throw new Error("Assigned user is not a member of this project");
    }
  }

  // Convert dueDate string to Date if provided
  if (updateData.dueDate) {
    updateData.dueDate = new Date(updateData.dueDate);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("project", "name description")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  return updatedTask;
};

// Delete a task
export const deleteTask = async (taskId, userId) => {
  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const task = await Task.findOne({
    _id: taskId,
    project: { $in: projectIds }
  });

  if (!task) {
    throw new Error("Task not found or access denied");
  }

  // Check permissions: Only task creator or project owner can delete
  const canDelete = 
    task.createdBy.toString() === userId ||
    await Project.findOne({ _id: task.project, owner: userId });

  if (!canDelete) {
    throw new Error("You don't have permission to delete this task");
  }

  await Task.findByIdAndDelete(taskId);
  return { message: "Task deleted successfully" };
};

// Assign task to a user
export const assignTask = async (taskId, assignedToUserId, userId) => {
  // First, get all projects the user has access to
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const task = await Task.findOne({
    _id: taskId,
    project: { $in: projectIds }
  });

  if (!task) {
    throw new Error("Task not found or access denied");
  }

  // Check permissions: Only task creator or project owner can assign
  const canAssign = 
    task.createdBy.toString() === userId ||
    await Project.findOne({ _id: task.project, owner: userId });

  if (!canAssign) {
    throw new Error("You don't have permission to assign this task");
  }

  // Validate assigned user
  const assignedUser = await User.findById(assignedToUserId);
  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  // Check if assigned user is a member of the project
  const project = await Project.findById(task.project);
  const isMember = project.members.some(member => member.toString() === assignedToUserId);
  if (!isMember) {
    throw new Error("Assigned user is not a member of this project");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { assignedTo: assignedToUserId },
    { new: true, runValidators: true }
  )
    .populate("project", "name description")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  return updatedTask;
};

// Check if user has access to task
export const checkTaskAccess = async (taskId, userId) => {
  const userProjects = await Project.find({
    $or: [
      { owner: userId },
      { members: userId }
    ]
  }).select("_id");

  const projectIds = userProjects.map(p => p._id);

  const task = await Task.findOne({
    _id: taskId,
    project: { $in: projectIds }
  });

  return !!task;
};
