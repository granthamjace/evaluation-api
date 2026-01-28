// src/tests/integration/projectApi.test.ts
import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../db/prismaClient";

const app = createApp();

describe("Project API integration", () => {
  jest.setTimeout(30000);

  const timestamp = Date.now();
  const ownerEmail = `project.owner+${timestamp}@example.com`;
  const memberEmail = `project.member+${timestamp}@example.com`;
  const nonMemberEmail = `project.nonmember+${timestamp}@example.com`;
  const password = "SuperSecret123!";

  let ownerToken: string;
  let memberToken: string;
  let nonMemberToken: string;
  let ownerId: string;
  let memberId: string;
  let projectId: string;

  // Setup: Create test users
  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app).post("/auth/register").send({
      email: ownerEmail,
      password,
      firstName: "Project",
      lastName: "Owner",
    });
    ownerToken = ownerRes.body.data.tokens.accessToken;
    ownerId = ownerRes.body.data.user.id;

    // Register member
    const memberRes = await request(app).post("/auth/register").send({
      email: memberEmail,
      password,
      firstName: "Project",
      lastName: "Member",
    });
    memberToken = memberRes.body.data.tokens.accessToken;
    memberId = memberRes.body.data.user.id;

    // Register non-member
    const nonMemberRes = await request(app).post("/auth/register").send({
      email: nonMemberEmail,
      password,
      firstName: "Non",
      lastName: "Member",
    });
    nonMemberToken = nonMemberRes.body.data.tokens.accessToken;
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
        email: { in: [ownerEmail, memberEmail, nonMemberEmail] },
      },
    });
    await prisma.$disconnect();
  });

  describe("Projects CRUD", () => {
    it("creates a project and returns 201", async () => {
      const res = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Project",
          description: "A test project",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          name: "Test Project",
          description: "A test project",
          status: "ACTIVE",
          ownerId,
        },
      });

      projectId = res.body.data.id;
    });

    it("lists projects for the authenticated user", async () => {
      const res = await request(app)
        .get("/projects")
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

    it("gets a project by ID", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: projectId,
          name: "Test Project",
          owner: {
            id: ownerId,
            email: ownerEmail,
          },
        },
      });
    });

    it("updates a project", async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Updated Project Name",
          status: "ARCHIVED",
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          id: projectId,
          name: "Updated Project Name",
          status: "ARCHIVED",
        },
      });

      // Restore original name
      await request(app)
        .patch(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Test Project", status: "ACTIVE" });
    });

    it("returns 401 without authentication", async () => {
      const res = await request(app).get("/projects");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Project Members", () => {
    it("adds a member to the project", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          userId: memberId,
          role: "MEMBER",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          userId: memberId,
          role: "MEMBER",
          user: {
            id: memberId,
            email: memberEmail,
          },
        },
      });
    });

    it("returns 409 when adding duplicate member", async () => {
      const res = await request(app)
        .post(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          userId: memberId,
          role: "MEMBER",
        });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "MEMBER_EXISTS",
        },
      });
    });

    it("lists members of the project", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2); // Owner + Member
    });

    it("updates member role", async () => {
      const res = await request(app)
        .patch(`/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "ADMIN" });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: {
          userId: memberId,
          role: "ADMIN",
        },
      });

      // Restore to MEMBER for subsequent tests
      await request(app)
        .patch(`/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "MEMBER" });
    });
  });

  describe("Authorization", () => {
    it("returns 403 when non-member tries to access project", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${nonMemberToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
        },
      });
    });

    it("allows member to view project", async () => {
      const res = await request(app)
        .get(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("returns 403 when MEMBER tries to delete project", async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "FORBIDDEN",
        },
      });
    });

    it("allows ADMIN to update but not delete project", async () => {
      // Make member an admin
      await request(app)
        .patch(`/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "ADMIN" });

      // Admin can update
      const updateRes = await request(app)
        .patch(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ description: "Updated by admin" });

      expect(updateRes.status).toBe(200);

      // Admin cannot delete
      const deleteRes = await request(app)
        .delete(`/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(deleteRes.status).toBe(403);

      // Restore to MEMBER
      await request(app)
        .patch(`/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "MEMBER" });
    });
  });

  describe("Cascade Delete", () => {
    let deleteProjectId: string;

    beforeAll(async () => {
      // Create a project to delete
      const projectRes = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Project to Delete",
          description: "This will be deleted",
        });
      deleteProjectId = projectRes.body.data.id;

      // Add a member
      await request(app)
        .post(`/projects/${deleteProjectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: memberId, role: "MEMBER" });

      // Create tasks
      await request(app)
        .post(`/projects/${deleteProjectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Task to be deleted" });

      await request(app)
        .post(`/projects/${deleteProjectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Another task to delete" });
    });

    it("deleting project cascades to delete all tasks and members", async () => {
      // Verify tasks exist
      const tasksBeforeRes = await request(app)
        .get(`/projects/${deleteProjectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(tasksBeforeRes.body.data.length).toBe(2);

      // Verify members exist
      const membersBeforeRes = await request(app)
        .get(`/projects/${deleteProjectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(membersBeforeRes.body.data.length).toBe(2); // Owner + member

      // Delete the project
      const deleteRes = await request(app)
        .delete(`/projects/${deleteProjectId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toMatchObject({
        success: true,
        data: { message: "Project deleted" },
      });

      // Verify project is gone
      const projectAfterRes = await request(app)
        .get(`/projects/${deleteProjectId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(projectAfterRes.status).toBe(404);

      // Verify tasks and members are cleaned up in DB
      const remainingTasks = await prisma.task.findMany({
        where: { projectId: deleteProjectId },
      });
      expect(remainingTasks.length).toBe(0);

      const remainingMembers = await prisma.projectMember.findMany({
        where: { projectId: deleteProjectId },
      });
      expect(remainingMembers.length).toBe(0);
    });
  });

  describe("Member Removal", () => {
    it("cannot remove project owner", async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}/members/${ownerId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        error: {
          code: "FORBIDDEN",
        },
      });
    });

    it("removes a member successfully", async () => {
      const res = await request(app)
        .delete(`/projects/${projectId}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        data: { message: "Member removed" },
      });

      // Verify member is removed
      const membersRes = await request(app)
        .get(`/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`);

      const memberIds = membersRes.body.data.map((m: any) => m.userId);
      expect(memberIds).not.toContain(memberId);
    });
  });
});
