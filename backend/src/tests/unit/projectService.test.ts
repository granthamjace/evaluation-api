// src/tests/unit/projectService.test.ts
import { projectService } from "../../modules/projects/project.service";
import { projectRepo } from "../../modules/projects/project.repo";
import { ProjectRole, ProjectStatus } from "@prisma/client";

jest.mock("../../modules/projects/project.repo", () => {
  return {
    projectRepo: {
      findPaginated: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getUserRole: jest.fn(),
    },
  };
});

describe("projectService.listProjects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call repo with normalized pagination and return paginated result", async () => {
    const mockedResult = {
      items: [
        {
          id: "project_1",
          name: "Test Project",
          description: "Test Description",
          status: ProjectStatus.ACTIVE,
          ownerId: "user_1",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-01T00:00:00.000Z"),
          _count: { members: 1, tasks: 5 },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };

    (projectRepo.findPaginated as jest.Mock).mockResolvedValueOnce(mockedResult);

    const result = await projectService.listProjects("user_1", {
      page: 1,
      pageSize: 20,
      search: "test",
    });

    expect(projectRepo.findPaginated).toHaveBeenCalledWith("user_1", {
      page: 1,
      pageSize: 20,
      status: undefined,
      search: "test",
    });

    expect(result).toEqual(mockedResult);
  });

  it("should clamp page and pageSize into allowed ranges", async () => {
    (projectRepo.findPaginated as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    });

    await projectService.listProjects("user_1", {
      page: -5,
      pageSize: 999,
      search: " ",
    });

    expect(projectRepo.findPaginated).toHaveBeenCalledWith("user_1", {
      page: 1,
      pageSize: 100,
      status: undefined,
      search: undefined,
    });
  });

  it("should use default pagination values when not provided", async () => {
    (projectRepo.findPaginated as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    await projectService.listProjects("user_1", {});

    expect(projectRepo.findPaginated).toHaveBeenCalledWith("user_1", {
      page: 1,
      pageSize: 20,
      status: undefined,
      search: undefined,
    });
  });

  it("should pass status filter to repo", async () => {
    (projectRepo.findPaginated as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    await projectService.listProjects("user_1", {
      status: ProjectStatus.ARCHIVED,
    });

    expect(projectRepo.findPaginated).toHaveBeenCalledWith("user_1", {
      page: 1,
      pageSize: 20,
      status: ProjectStatus.ARCHIVED,
      search: undefined,
    });
  });
});

describe("projectService.getProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return project when user has access", async () => {
    const mockProject = {
      id: "project_1",
      name: "Test Project",
      description: "Test Description",
      status: ProjectStatus.ACTIVE,
      ownerId: "user_1",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (projectRepo.findById as jest.Mock).mockResolvedValueOnce(mockProject);

    const result = await projectService.getProject("project_1", "user_1");

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(projectRepo.findById).toHaveBeenCalledWith("project_1");
    expect(result).toEqual(mockProject);
  });

  it("should throw 404 when user is not a member", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      projectService.getProject("project_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(projectRepo.findById).not.toHaveBeenCalled();
  });

  it("should throw 404 when project does not exist", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (projectRepo.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      projectService.getProject("project_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });
  });
});

describe("projectService.updateProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update project when user is OWNER", async () => {
    const mockUpdatedProject = {
      id: "project_1",
      name: "Updated Project",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.OWNER);
    (projectRepo.update as jest.Mock).mockResolvedValueOnce(mockUpdatedProject);

    const result = await projectService.updateProject("project_1", "user_1", {
      name: "Updated Project",
    });

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(projectRepo.update).toHaveBeenCalledWith("project_1", {
      name: "Updated Project",
    });
    expect(result).toEqual(mockUpdatedProject);
  });

  it("should update project when user is ADMIN", async () => {
    const mockUpdatedProject = {
      id: "project_1",
      name: "Updated Project",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.ADMIN);
    (projectRepo.update as jest.Mock).mockResolvedValueOnce(mockUpdatedProject);

    const result = await projectService.updateProject("project_1", "user_1", {
      name: "Updated Project",
    });

    expect(projectRepo.update).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedProject);
  });

  it("should throw 403 when user is MEMBER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);

    await expect(
      projectService.updateProject("project_1", "user_1", { name: "Updated" })
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(projectRepo.update).not.toHaveBeenCalled();
  });

  it("should throw 403 when user is VIEWER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.VIEWER);

    await expect(
      projectService.updateProject("project_1", "user_1", { name: "Updated" })
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(projectRepo.update).not.toHaveBeenCalled();
  });

  it("should throw 404 when user has no role in project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      projectService.updateProject("project_1", "user_1", { name: "Updated" })
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(projectRepo.update).not.toHaveBeenCalled();
  });
});

describe("projectService.deleteProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete project when user is OWNER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.OWNER);
    (projectRepo.delete as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await projectService.deleteProject("project_1", "user_1");

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(projectRepo.delete).toHaveBeenCalledWith("project_1");
    expect(result).toEqual({ message: "Project deleted" });
  });

  it("should throw 403 when user is ADMIN", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.ADMIN);

    await expect(
      projectService.deleteProject("project_1", "user_1")
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(projectRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 403 when user is MEMBER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);

    await expect(
      projectService.deleteProject("project_1", "user_1")
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(projectRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 404 when user has no role in project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      projectService.deleteProject("project_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(projectRepo.delete).not.toHaveBeenCalled();
  });
});

describe("projectService.createProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create project with provided data", async () => {
    const mockCreatedProject = {
      id: "project_1",
      name: "New Project",
      description: "Description",
      status: ProjectStatus.ACTIVE,
      ownerId: "user_1",
    };

    (projectRepo.create as jest.Mock).mockResolvedValueOnce(mockCreatedProject);

    const result = await projectService.createProject("user_1", {
      name: "New Project",
      description: "Description",
    });

    expect(projectRepo.create).toHaveBeenCalledWith("user_1", {
      name: "New Project",
      description: "Description",
    });
    expect(result).toEqual(mockCreatedProject);
  });
});
