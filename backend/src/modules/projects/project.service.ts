// src/modules/projects/project.service.ts
import { projectRepo } from "./project.repo";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsParams,
  PaginatedProjectsResult,
} from "./project.types";
import { ProjectRole } from "@prisma/client";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const projectService = {
  async listProjects(
    userId: string,
    params: Partial<ListProjectsParams> = {}
  ): Promise<PaginatedProjectsResult> {
    let page = params.page ?? DEFAULT_PAGE;
    let pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const search = params.search?.trim() || undefined;

    return projectRepo.findPaginated(userId, {
      page,
      pageSize,
      status: params.status,
      search,
    });
  },

  async getProject(projectId: string, userId: string) {
    const role = await projectRepo.getUserRole(projectId, userId);
    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    const project = await projectRepo.findById(projectId);
    if (!project) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    return project;
  },

  async createProject(userId: string, data: CreateProjectInput) {
    return projectRepo.create(userId, data);
  },

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectInput
  ) {
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

    return projectRepo.update(projectId, data);
  },

  async deleteProject(projectId: string, userId: string) {
    const role = await projectRepo.getUserRole(projectId, userId);

    if (!role) {
      const error: any = new Error("Project not found");
      error.status = 404;
      error.code = "PROJECT_NOT_FOUND";
      throw error;
    }

    if (role !== ProjectRole.OWNER) {
      const error: any = new Error("Insufficient permissions");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    await projectRepo.delete(projectId);
    return { message: "Project deleted" };
  },
};
