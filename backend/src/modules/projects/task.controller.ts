// src/modules/projects/task.controller.ts
import type { Response, NextFunction } from "express";
import { taskService } from "./task.service";
import type { ProjectAuthRequest } from "../../middlewares/projectAuth";

export const taskController = {
  async list(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const userId = req.user!.id;
      const { page, pageSize, status, priority, assigneeId, search } =
        req.query;

      const result = await taskService.listTasks(projectId, userId, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        status: status as any,
        priority: priority as any,
        assigneeId: assigneeId as string,
        search: search as string,
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

  async create(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const userId = req.user!.id;

      const task = await taskService.createTask(projectId, userId, req.body);

      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  async get(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const taskId = req.params.taskId;
      const userId = req.user!.id;

      const task = await taskService.getTask(projectId, taskId, userId);

      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  async update(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const taskId = req.params.taskId;
      const userId = req.user!.id;

      const task = await taskService.updateTask(
        projectId,
        taskId,
        userId,
        req.body
      );

      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const taskId = req.params.taskId;
      const userId = req.user!.id;

      const result = await taskService.deleteTask(projectId, taskId, userId);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
