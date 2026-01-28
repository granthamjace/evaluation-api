// src/tests/integration/taskApi.test.ts
import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../db/prismaClient";

const app = createApp();

describe("Task API integration", () => {
  jest.setTimeout(30000);

  const timestamp = Date.now();
  const ownerEmail = `task.owner+${timestamp}@example.com`;
  const memberEmail = `task.member+${timestamp}@example.com`;
  const viewerEmail = `task.viewer+${timestamp}@example.com`;
  const assigneeEmail = `task.assignee+${timestamp}@example.com`;
  const password = "SuperSecret123!";

  let ownerToken: string;
  let memberToken: string;
  let viewerToken: string;
  let assigneeToken: string;
  let ownerId: string;
  let memberId: string;
  let viewerId: string;
  let assigneeId: string;
  let projectId: string;
  let secondProjectId: string;
  let taskId: string;

  // Setup: Create test users and project
  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app).post("/auth/register").send({
      email: ownerEmail,
      password,
      firstName: "Task",
      lastName: "Owner",
    });
    ownerToken = ownerRes.body.data.tokens.accessToken;
    ownerId = ownerRes.body.data.user.id;

    // Register member
    const memberRes = await request(app).post("/auth/register").send({
      email: memberEmail,
      password,
      firstName: "Task",
      lastName: "Member",
    });
    memberToken = memberRes.body.data.tokens.accessToken;
    memberId = memberRes.body.data.user.id;

    // Register viewer
    const viewerRes = await request(app).post("/auth/register").send({
      email: viewerEmail,
      password,
      firstName: "Task",
      lastName: "Viewer",
    });
    viewerToken = viewerRes.body.data.tokens.accessToken;
    viewerId = viewerRes.body.data.user.id;

    // Register assignee (will be deleted later)
    const assigneeRes = await request(app).post("/auth/register").send({
      email: assigneeEmail,
      password,
      firstName: "Task",
      lastName: "Assignee",
    });
    assigneeToken = assigneeRes.body.data.tokens.accessToken;
    assigneeId = assigneeRes.body.data.user.id;

    // Create project
    const projectRes = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Task Test Project",
        description: "Project for testing tasks",
      });
    projectId = projectRes.body.data.id;

    // Create second project for testing same title in different projects
    const secondProjectRes = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Second Task Test Project",
        description: "Second project for task tests",
      });
    secondProjectId = secondProjectRes.body.data.id;

    // Add member to project
    await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: memberId, role: "MEMBER" });

    // Add viewer to project
    await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: viewerId, role: "VIEWER" });

    // Add assignee to project
    await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: assigneeId, role: "MEMBER" });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await prisma.task.deleteMany({
      where: { project: { ownerId } },
    });
    await prisma.projectMember.deleteMany({
      where: { project: { ownerId } },
    });
    await prisma.project.deleteMany({
      where: { ownerId },
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: [ownerEmail, memberEmail, viewerEmail, assigneeEmail] },
      },
    });
    await prisma.$disconnect();
  });

  describe("Task CRUD", () => {
    it("creates a task and returns 201", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "First Task",
          description: "Task description",
          priority: "HIGH",
          status: "TODO",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          title: "First Task",
          description: "Task description",
          priority: "HIGH",
          status: "TODO",
          projectId,
        },
      });

      taskId = res.body.data.id;
    });

    it("lists tasks for the project", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
      });
    });

    it("gets a task by ID", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: taskId,
          title: "First Task",
          projectId,
        },
      });
    });

    it("updates a task", async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "Updated Task Title",
          status: "IN_PROGRESS",
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: taskId,
          title: "Updated Task Title",
          status: "IN_PROGRESS",
        },
      });

      // Restore original title
      await request(app)
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "First Task", status: "TODO" });
    });

    it("returns 404 for non-existent task", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks/nonexistent-id`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "TASK_NOT_FOUND",
        },
      });
    });
  });

  describe("Duplicate Title Constraint", () => {
    it("returns 409 when creating task with duplicate title in same project", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "First Task",
          description: "Duplicate title attempt",
        });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "DUPLICATE_TASK_TITLE",
        },
      });
    });

    it("allows same task title in different projects", async () => {
      const res = await request(app)
        .post(`/projects/${secondProjectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "First Task",
          description: "Same title in different project",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          title: "First Task",
          projectId: secondProjectId,
        },
      });
    });

    it("returns 409 when updating task to have duplicate title", async () => {
      // Create another task
      const createRes = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "Second Task",
          description: "Another task",
        });

      const secondTaskId = createRes.body.data.id;

      // Try to update to duplicate title
      const res = await request(app)
        .patch(`/projects/${projectId}/tasks/${secondTaskId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "First Task" });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "DUPLICATE_TASK_TITLE",
        },
      });
    });
  });

  describe("Assignee Validation", () => {
    it("allows assigning task to project member", async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ assigneeId: memberId });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: taskId,
          assigneeId: memberId,
          assignee: {
            id: memberId,
            email: memberEmail,
          },
        },
      });
    });

    it("returns 400 when assigning to non-member", async () => {
      // Create a user who is not a project member
      const nonMemberRes = await request(app).post("/auth/register").send({
        email: `nonmember+${timestamp}@example.com`,
        password,
        firstName: "Non",
        lastName: "Member",
      });
      const nonMemberId = nonMemberRes.body.data.user.id;

      const res = await request(app)
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ assigneeId: nonMemberId });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "INVALID_ASSIGNEE",
        },
      });

      // Clean up non-member user
      await prisma.user.delete({ where: { id: nonMemberId } });
    });

    it("allows creating task with assignee", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "Task With Assignee",
          assigneeId: memberId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          title: "Task With Assignee",
          assigneeId: memberId,
        },
      });
    });
  });

  describe("Authorization", () => {
    it("allows MEMBER to create tasks", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          title: "Member Created Task",
          description: "Created by member",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("allows MEMBER to update tasks", async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ description: "Updated by member" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 403 when MEMBER tries to delete task", async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "FORBIDDEN",
        },
      });
    });

    it("returns 403 when VIEWER tries to create task", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          title: "Viewer Task Attempt",
          description: "Should fail",
        });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "FORBIDDEN",
        },
      });
    });

    it("allows VIEWER to view tasks", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("allows OWNER to delete task", async () => {
      // Create a task to delete
      const createRes = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Task To Delete" });

      const deleteTaskId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/projects/${projectId}/tasks/${deleteTaskId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: { message: "Task deleted" },
      });
    });
  });

  describe("SetNull on User Delete", () => {
    let assignedTaskId: string;

    beforeAll(async () => {
      // Create a task assigned to the assignee user
      const createRes = await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "Task For SetNull Test",
          description: "This task will have its assignee deleted",
          assigneeId: assigneeId,
        });

      assignedTaskId = createRes.body.data.id;

      // Verify task has assignee
      const taskRes = await request(app)
        .get(`/projects/${projectId}/tasks/${assignedTaskId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(taskRes.body.data.assigneeId).toBe(assigneeId);
    });

    it("sets task.assigneeId to null when assignee user is deleted", async () => {
      // Delete the assignee user directly from database
      await prisma.user.delete({ where: { id: assigneeId } });

      // Fetch the task again
      const res = await request(app)
        .get(`/projects/${projectId}/tasks/${assignedTaskId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.assigneeId).toBeNull();
      expect(res.body.data.assignee).toBeNull();
    });
  });

  describe("Task Filtering", () => {
    beforeAll(async () => {
      // Create tasks with different statuses and priorities for filtering tests
      await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "High Priority Todo",
          status: "TODO",
          priority: "HIGH",
        });

      await request(app)
        .post(`/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          title: "Low Priority Done",
          status: "DONE",
          priority: "LOW",
        });
    });

    it("filters tasks by status", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks?status=TODO`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((task: any) => {
        expect(task.status).toBe("TODO");
      });
    });

    it("filters tasks by priority", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks?priority=HIGH`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((task: any) => {
        expect(task.priority).toBe("HIGH");
      });
    });

    it("searches tasks by title", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/tasks?search=Priority`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach((task: any) => {
        expect(task.title.toLowerCase()).toContain("priority");
      });
    });
  });
});
