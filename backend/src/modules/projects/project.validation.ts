// src/modules/projects/project.validation.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
});

export type CreateProjectBody = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
});

export type UpdateProjectBody = z.infer<typeof updateProjectSchema>;

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
  search: z.string().optional(),
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
