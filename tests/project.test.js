import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Project } from "../src/models/project.model.js";
import { connectDB } from "../src/config/db.js";
import mongoose from "mongoose";

describe("Project CRUD Operations", () => {
  let authToken;
  let userId;
  let projectId;
  let secondUserToken;
  let secondUserId;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
    
    // Clean up existing data
    await User.deleteMany({});
    await Project.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Project.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test users
    const user1 = await User.create({
      name: "Test User 1",
      email: "test1@example.com",
      password: "$2b$10$testpasswordhash",
    });

    const user2 = await User.create({
      name: "Test User 2", 
      email: "test2@example.com",
      password: "$2b$10$testpasswordhash",
    });

    userId = user1._id.toString();
    secondUserId = user2._id.toString();

    // Login to get auth tokens
    const loginResponse1 = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test1@example.com",
        password: "password123"
      });

    const loginResponse2 = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test2@example.com", 
        password: "password123"
      });

    authToken = loginResponse1.body.data.accessToken;
    secondUserToken = loginResponse2.body.data.accessToken;
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await Project.deleteMany({});
  });

  describe("POST /api/projects", () => {
    it("should create a new project successfully", async () => {
      const projectData = {
        name: "Test Project",
        description: "A test project description"
      };

      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Project created successfully");
      expect(response.body.data.name).toBe(projectData.name);
      expect(response.body.data.description).toBe(projectData.description);
      expect(response.body.data.owner._id).toBe(userId);
      expect(response.body.data.members).toHaveLength(1);
      expect(response.body.data.members[0]._id).toBe(userId);

      projectId = response.body.data._id;
    });

    it("should fail to create project without authentication", async () => {
      const projectData = {
        name: "Test Project",
        description: "A test project description"
      };

      const response = await request(app)
        .post("/api/projects")
        .send(projectData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Access token required");
    });

    it("should fail to create project with invalid data", async () => {
      const projectData = {
        name: "", // Invalid: empty name
        description: "A test project description"
      };

      const response = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/projects", () => {
    beforeEach(async () => {
      // Create test projects
      const project1 = await Project.create({
        name: "Project 1",
        description: "First project",
        owner: userId,
        members: [userId]
      });

      const project2 = await Project.create({
        name: "Project 2", 
        description: "Second project",
        owner: userId,
        members: [userId]
      });

      projectId = project1._id.toString();
    });

    it("should get all projects for authenticated user", async () => {
      const response = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Projects retrieved successfully");
      expect(response.body.data.projects).toHaveLength(2);
      expect(response.body.data.pagination.totalItems).toBe(2);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/projects?page=1&limit=1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(1);
    });

    it("should support search functionality", async () => {
      const response = await request(app)
        .get("/api/projects?search=Project 1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(1);
      expect(response.body.data.projects[0].name).toBe("Project 1");
    });
  });

  describe("GET /api/projects/:id", () => {
    beforeEach(async () => {
      const project = await Project.create({
        name: "Test Project",
        description: "A test project",
        owner: userId,
        members: [userId]
      });

      projectId = project._id.toString();
    });

    it("should get a specific project by ID", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Project retrieved successfully");
      expect(response.body.data._id).toBe(projectId);
      expect(response.body.data.name).toBe("Test Project");
    });

    it("should fail to get project without access", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found or access denied");
    });
  });

  describe("PUT /api/projects/:id", () => {
    beforeEach(async () => {
      const project = await Project.create({
        name: "Original Project",
        description: "Original description",
        owner: userId,
        members: [userId]
      });

      projectId = project._id.toString();
    });

    it("should update project successfully", async () => {
      const updateData = {
        name: "Updated Project",
        description: "Updated description"
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Project updated successfully");
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it("should fail to update project without ownership", async () => {
      const updateData = {
        name: "Hacked Project"
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found or you don't have permission to update it");
    });
  });

  describe("DELETE /api/projects/:id", () => {
    beforeEach(async () => {
      const project = await Project.create({
        name: "Project to Delete",
        description: "This project will be deleted",
        owner: userId,
        members: [userId]
      });

      projectId = project._id.toString();
    });

    it("should delete project successfully", async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Project deleted successfully");

      // Verify project is deleted
      const deletedProject = await Project.findById(projectId);
      expect(deletedProject).toBeNull();
    });

    it("should fail to delete project without ownership", async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found or you don't have permission to delete it");
    });
  });

  describe("POST /api/projects/:id/members", () => {
    beforeEach(async () => {
      const project = await Project.create({
        name: "Project with Members",
        description: "A project for member management",
        owner: userId,
        members: [userId]
      });

      projectId = project._id.toString();
    });

    it("should add member to project successfully", async () => {
      const memberData = {
        email: "test2@example.com"
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(memberData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Member added successfully");
      expect(response.body.data.members).toHaveLength(2);
    });

    it("should fail to add non-existent user", async () => {
      const memberData = {
        email: "nonexistent@example.com"
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(memberData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });

    it("should fail to add member without ownership", async () => {
      const memberData = {
        email: "test1@example.com"
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(memberData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found or you don't have permission to add members");
    });
  });

  describe("DELETE /api/projects/:id/members", () => {
    beforeEach(async () => {
      const project = await Project.create({
        name: "Project with Members",
        description: "A project for member management",
        owner: userId,
        members: [userId, secondUserId]
      });

      projectId = project._id.toString();
    });

    it("should remove member from project successfully", async () => {
      const memberData = {
        userId: secondUserId
      };

      const response = await request(app)
        .delete(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(memberData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Member removed successfully");
      expect(response.body.data.members).toHaveLength(1);
    });

    it("should fail to remove project owner", async () => {
      const memberData = {
        userId: userId
      };

      const response = await request(app)
        .delete(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(memberData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cannot remove the project owner");
    });

    it("should fail to remove member without ownership", async () => {
      const memberData = {
        userId: userId
      };

      const response = await request(app)
        .delete(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${secondUserToken}`)
        .send(memberData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found or you don't have permission to remove members");
    });
  });
});
