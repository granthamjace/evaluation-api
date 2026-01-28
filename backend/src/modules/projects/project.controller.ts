// src/modules/projects/project.controller.ts
import type { Request, Response, NextFunction } from "express";
import { projectService } from "./project.service";
import type { AuthenticatedRequest } from "../../middlewares/authGuard";

export const projectController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
      const pageSize = req.query.pageSize
        ? parseInt(String(req.query.pageSize), 10)
        : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await projectService.listProjects(userId, {
        page,
        pageSize,
        search,
        status: status as any,
      });

      res.json({
        success: true,
        data: result.items,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, description, status } = req.body;

      const project = await projectService.createProject(userId, {
        name,
        description,
        status,
      });

      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;

      const project = await projectService.getProject(projectId, userId);

      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;
      const { name, description, status } = req.body;

      const project = await projectService.updateProject(projectId, userId, {
        name,
        description,
        status,
      });

      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id;

      const result = await projectService.deleteProject(projectId, userId);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
