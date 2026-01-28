// src/modules/projects/project.types.ts
import type { ProjectStatus } from "@prisma/client";

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ListProjectsParams {
  page: number;
  pageSize: number;
  status?: ProjectStatus;
  search?: string;
}

export interface ProjectWithCounts {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    tasks: number;
  };
}

export interface PaginatedProjectsResult {
  items: ProjectWithCounts[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
