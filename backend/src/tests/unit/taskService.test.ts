// src/tests/unit/taskService.test.ts
import { taskService } from "../../modules/projects/task.service";
import { taskRepo } from "../../modules/projects/task.repo";
import { projectRepo } from "../../modules/projects/project.repo";
import { ProjectRole, TaskStatus, TaskPriority } from "@prisma/client";

jest.mock("../../modules/projects/task.repo", () => {
  return {
    taskRepo: {
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findByProjectAndTitle: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

jest.mock("../../modules/projects/project.repo", () => {
  return {
    projectRepo: {
      getUserRole: jest.fn(),
    },
  };
});

describe("taskService.listTasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call repo with normalized pagination and return paginated result", async () => {
    const mockedResult = {
      items: [
        {
          id: "task_1",
          projectId: "project_1",
          title: "Test Task",
          description: "Test Description",
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          assigneeId: null,
          dueDate: null,
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-01T00:00:00.000Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findPaginated as jest.Mock).mockResolvedValueOnce(mockedResult);

    const result = await taskService.listTasks("project_1", "user_1", {
      page: 1,
      pageSize: 20,
      search: "test",
    });

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(taskRepo.findPaginated).toHaveBeenCalledWith("project_1", {
      page: 1,
      pageSize: 20,
      status: undefined,
      priority: undefined,
      assigneeId: undefined,
      search: "test",
    });
    expect(result).toEqual(mockedResult);
  });

  it("should clamp page and pageSize into allowed ranges", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findPaginated as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    });

    await taskService.listTasks("project_1", "user_1", {
      page: -5,
      pageSize: 999,
      search: " ",
    });

    expect(taskRepo.findPaginated).toHaveBeenCalledWith("project_1", {
      page: 1,
      pageSize: 100,
      status: undefined,
      priority: undefined,
      assigneeId: undefined,
      search: undefined,
    });
  });

  it("should throw 404 when user is not a project member", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.listTasks("project_1", "user_1", {})
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(taskRepo.findPaginated).not.toHaveBeenCalled();
  });

  it("should pass filters to repo", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findPaginated as jest.Mock).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    await taskService.listTasks("project_1", "user_1", {
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: "assignee_1",
    });

    expect(taskRepo.findPaginated).toHaveBeenCalledWith("project_1", {
      page: 1,
      pageSize: 20,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: "assignee_1",
      search: undefined,
    });
  });
});

describe("taskService.createTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create task when user has MEMBER role", async () => {
    const mockCreatedTask = {
      id: "task_1",
      projectId: "project_1",
      title: "New Task",
      description: "Description",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce(null);
    (taskRepo.create as jest.Mock).mockResolvedValueOnce(mockCreatedTask);

    const result = await taskService.createTask("project_1", "user_1", {
      title: "New Task",
      description: "Description",
    });

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(taskRepo.create).toHaveBeenCalledWith("project_1", {
      title: "New Task",
      description: "Description",
    });
    expect(result).toEqual(mockCreatedTask);
  });

  it("should throw 403 when user is VIEWER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.VIEWER);

    await expect(
      taskService.createTask("project_1", "user_1", { title: "New Task" })
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(taskRepo.create).not.toHaveBeenCalled();
  });

  it("should throw 404 when user is not a project member", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.createTask("project_1", "user_1", { title: "New Task" })
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(taskRepo.create).not.toHaveBeenCalled();
  });

  it("should throw 409 when task with same title already exists in project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce({
      id: "existing_task",
      title: "Duplicate Title",
      projectId: "project_1",
    });

    await expect(
      taskService.createTask("project_1", "user_1", { title: "Duplicate Title" })
    ).rejects.toMatchObject({
      status: 409,
      code: "DUPLICATE_TASK_TITLE",
    });

    expect(taskRepo.create).not.toHaveBeenCalled();
  });

  it("should throw 400 when assignee is not a project member", async () => {
    (projectRepo.getUserRole as jest.Mock)
      .mockResolvedValueOnce(ProjectRole.MEMBER) // user's role
      .mockResolvedValueOnce(null); // assignee's role (not a member)
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.createTask("project_1", "user_1", {
        title: "New Task",
        assigneeId: "non_member_user",
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_ASSIGNEE",
    });

    expect(taskRepo.create).not.toHaveBeenCalled();
  });

  it("should create task with valid assignee who is a project member", async () => {
    const mockCreatedTask = {
      id: "task_1",
      projectId: "project_1",
      title: "New Task",
      assigneeId: "assignee_1",
    };

    (projectRepo.getUserRole as jest.Mock)
      .mockResolvedValueOnce(ProjectRole.MEMBER) // user's role
      .mockResolvedValueOnce(ProjectRole.MEMBER); // assignee's role
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce(null);
    (taskRepo.create as jest.Mock).mockResolvedValueOnce(mockCreatedTask);

    const result = await taskService.createTask("project_1", "user_1", {
      title: "New Task",
      assigneeId: "assignee_1",
    });

    expect(projectRepo.getUserRole).toHaveBeenCalledTimes(2);
    expect(projectRepo.getUserRole).toHaveBeenNthCalledWith(1, "project_1", "user_1");
    expect(projectRepo.getUserRole).toHaveBeenNthCalledWith(2, "project_1", "assignee_1");
    expect(taskRepo.create).toHaveBeenCalled();
    expect(result).toEqual(mockCreatedTask);
  });
});

describe("taskService.updateTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update task when user has MEMBER role", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Old Title",
      status: TaskStatus.TODO,
    };
    const updatedTask = {
      ...existingTask,
      title: "New Title",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce(null);
    (taskRepo.update as jest.Mock).mockResolvedValueOnce(updatedTask);

    const result = await taskService.updateTask("project_1", "task_1", "user_1", {
      title: "New Title",
    });

    expect(taskRepo.update).toHaveBeenCalledWith("task_1", { title: "New Title" });
    expect(result).toEqual(updatedTask);
  });

  it("should throw 403 when user is VIEWER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.VIEWER);

    await expect(
      taskService.updateTask("project_1", "task_1", "user_1", { title: "New Title" })
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  it("should throw 404 when task does not exist", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.updateTask("project_1", "task_1", "user_1", { title: "New Title" })
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });

    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  it("should throw 404 when task belongs to different project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce({
      id: "task_1",
      projectId: "other_project",
      title: "Task",
    });

    await expect(
      taskService.updateTask("project_1", "task_1", "user_1", { title: "New Title" })
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });

    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  it("should throw 409 when updating to a duplicate title", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Original Title",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.findByProjectAndTitle as jest.Mock).mockResolvedValueOnce({
      id: "task_2",
      projectId: "project_1",
      title: "Duplicate Title",
    });

    await expect(
      taskService.updateTask("project_1", "task_1", "user_1", { title: "Duplicate Title" })
    ).rejects.toMatchObject({
      status: 409,
      code: "DUPLICATE_TASK_TITLE",
    });

    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  it("should not check for duplicate when title is unchanged", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Same Title",
      status: TaskStatus.TODO,
    };
    const updatedTask = {
      ...existingTask,
      status: TaskStatus.IN_PROGRESS,
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.update as jest.Mock).mockResolvedValueOnce(updatedTask);

    await taskService.updateTask("project_1", "task_1", "user_1", {
      title: "Same Title",
      status: TaskStatus.IN_PROGRESS,
    });

    // findByProjectAndTitle should not be called when title is unchanged
    expect(taskRepo.findByProjectAndTitle).not.toHaveBeenCalled();
    expect(taskRepo.update).toHaveBeenCalled();
  });

  it("should throw 400 when updating assignee to non-member", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Task",
    };

    (projectRepo.getUserRole as jest.Mock)
      .mockResolvedValueOnce(ProjectRole.MEMBER) // user's role
      .mockResolvedValueOnce(null); // assignee's role (not a member)
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);

    await expect(
      taskService.updateTask("project_1", "task_1", "user_1", {
        assigneeId: "non_member_user",
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_ASSIGNEE",
    });

    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  it("should update task with valid assignee who is a project member", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Task",
    };
    const updatedTask = {
      ...existingTask,
      assigneeId: "assignee_1",
    };

    (projectRepo.getUserRole as jest.Mock)
      .mockResolvedValueOnce(ProjectRole.MEMBER) // user's role
      .mockResolvedValueOnce(ProjectRole.MEMBER); // assignee's role
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.update as jest.Mock).mockResolvedValueOnce(updatedTask);

    const result = await taskService.updateTask("project_1", "task_1", "user_1", {
      assigneeId: "assignee_1",
    });

    expect(projectRepo.getUserRole).toHaveBeenCalledTimes(2);
    expect(taskRepo.update).toHaveBeenCalledWith("task_1", { assigneeId: "assignee_1" });
    expect(result).toEqual(updatedTask);
  });
});

describe("taskService.deleteTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete task when user is OWNER", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Task to delete",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.OWNER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.delete as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await taskService.deleteTask("project_1", "task_1", "user_1");

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(taskRepo.delete).toHaveBeenCalledWith("task_1");
    expect(result).toEqual({ message: "Task deleted" });
  });

  it("should delete task when user is ADMIN", async () => {
    const existingTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Task to delete",
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.ADMIN);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(existingTask);
    (taskRepo.delete as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await taskService.deleteTask("project_1", "task_1", "user_1");

    expect(taskRepo.delete).toHaveBeenCalledWith("task_1");
    expect(result).toEqual({ message: "Task deleted" });
  });

  it("should throw 403 when user is MEMBER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);

    await expect(
      taskService.deleteTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(taskRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 403 when user is VIEWER", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.VIEWER);

    await expect(
      taskService.deleteTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });

    expect(taskRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 404 when user is not a project member", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.deleteTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(taskRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 404 when task does not exist", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.OWNER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.deleteTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });

    expect(taskRepo.delete).not.toHaveBeenCalled();
  });

  it("should throw 404 when task belongs to different project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.OWNER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce({
      id: "task_1",
      projectId: "other_project",
      title: "Task",
    });

    await expect(
      taskService.deleteTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });

    expect(taskRepo.delete).not.toHaveBeenCalled();
  });
});

describe("taskService.getTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return task when user is a project member", async () => {
    const mockTask = {
      id: "task_1",
      projectId: "project_1",
      title: "Test Task",
      status: TaskStatus.TODO,
    };

    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(mockTask);

    const result = await taskService.getTask("project_1", "task_1", "user_1");

    expect(projectRepo.getUserRole).toHaveBeenCalledWith("project_1", "user_1");
    expect(taskRepo.findById).toHaveBeenCalledWith("task_1");
    expect(result).toEqual(mockTask);
  });

  it("should throw 404 when user is not a project member", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.getTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "PROJECT_NOT_FOUND",
    });

    expect(taskRepo.findById).not.toHaveBeenCalled();
  });

  it("should throw 404 when task does not exist", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      taskService.getTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });
  });

  it("should throw 404 when task belongs to different project", async () => {
    (projectRepo.getUserRole as jest.Mock).mockResolvedValueOnce(ProjectRole.MEMBER);
    (taskRepo.findById as jest.Mock).mockResolvedValueOnce({
      id: "task_1",
      projectId: "other_project",
      title: "Task",
    });

    await expect(
      taskService.getTask("project_1", "task_1", "user_1")
    ).rejects.toMatchObject({
      status: 404,
      code: "TASK_NOT_FOUND",
    });
  });
});
