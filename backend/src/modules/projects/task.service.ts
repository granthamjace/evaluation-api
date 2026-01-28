// src/modules/projects/task.service.ts
import { taskRepo } from "./task.repo";
import { projectRepo } from "./project.repo";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksParams,
  PaginatedTasksResult,
} from "./task.types";
import { ProjectRole } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const taskService = {
  async listTasks(
    projectId: string,
    userId: string,
    params: Partial<ListTasksParams> = {}
  ): Promise<PaginatedTasksResult> {
    // Verify user is a member
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    let page = params.page ?? DEFAULT_PAGE;
    let pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const search = params.search?.trim() || undefined;

    return taskRepo.findPaginated(projectId, {
      page,
      pageSize,
      status: params.status,
      priority: params.priority,
      assigneeId: params.assigneeId,
      search,
    });
  },

  async getTask(projectId: string, taskId: string, userId: string) {
    // Verify user is a member
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    const task = await taskRepo.findById(taskId);
    if (!task || task.projectId !== projectId) {
      const error: any = new Error("Task not found");
      error.status = 404;
      error.code = "TASK_NOT_FOUND";
      throw error;
    }

    return task;
  },

  async createTask(projectId: string, userId: string, data: CreateTaskInput) {
    // Verify user has create permission (OWNER, ADMIN, MEMBER)
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    if (role === ProjectRole.VIEWER) {
      const error: any = new Error("Insufficient permissions");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Check for duplicate title
    const existingTask = await taskRepo.findByProjectAndTitle(
      projectId,
      data.title
    );
    if (existingTask) {
      const error: any = new Error(
        "Task with this title already exists in the project"
      );
      error.status = 409;
      error.code = "DUPLICATE_TASK_TITLE";
      throw error;
    }

    // Validate assignee if provided
    if (data.assigneeId) {
      const assigneeRole = await projectRepo.getUserRole(
        projectId,
        data.assigneeId
      );
      if (!assigneeRole) {
        const error: any = new Error("Assignee is not a project member");
        error.status = 400;
        error.code = "INVALID_ASSIGNEE";
        throw error;
      }
    }

    return taskRepo.create(projectId, data);
  },

  async updateTask(
    projectId: string,
    taskId: string,
    userId: string,
    data: UpdateTaskInput
  ) {
    // Verify user has update permission (OWNER, ADMIN, MEMBER)
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    if (role === ProjectRole.VIEWER) {
      const error: any = new Error("Insufficient permissions");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Verify task exists and belongs to project
    const task = await taskRepo.findById(taskId);
    if (!task || task.projectId !== projectId) {
      const error: any = new Error("Task not found");
      error.status = 404;
      error.code = "TASK_NOT_FOUND";
      throw error;
    }

    // Check for duplicate title if title is being updated
    if (data.title && data.title !== task.title) {
      const existingTask = await taskRepo.findByProjectAndTitle(
        projectId,
        data.title
      );
      if (existingTask) {
        const error: any = new Error(
          "Task with this title already exists in the project"
        );
        error.status = 409;
        error.code = "DUPLICATE_TASK_TITLE";
        throw error;
      }
    }

    // Validate assignee if being updated (not null)
    if (data.assigneeId) {
      const assigneeRole = await projectRepo.getUserRole(
        projectId,
        data.assigneeId
      );
      if (!assigneeRole) {
        const error: any = new Error("Assignee is not a project member");
        error.status = 400;
        error.code = "INVALID_ASSIGNEE";
        throw error;
      }
    }

    return taskRepo.update(taskId, data);
  },

  async deleteTask(projectId: string, taskId: string, userId: string) {
    // Verify user has delete permission (OWNER, ADMIN only)
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    if (role !== ProjectRole.OWNER && role !== ProjectRole.ADMIN) {
      const error: any = new Error("Insufficient permissions");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Verify task exists and belongs to project
    const task = await taskRepo.findById(taskId);
    if (!task || task.projectId !== projectId) {
      const error: any = new Error("Task not found");
      error.status = 404;
      error.code = "TASK_NOT_FOUND";
      throw error;
    }

    await taskRepo.delete(taskId);
    return { message: "Task deleted" };
  },
};
