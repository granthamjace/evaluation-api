// src/modules/projects/task.router.ts
import { Router } from "express";
import { taskController } from "./task.controller";
import { validateBody, validateQuery } from "../../middlewares/validation";
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} from "./task.validation";
import {
  requireProjectMember,
  requireProjectRole,
} from "../../middlewares/projectAuth";

// Router with mergeParams to access :id from parent router
export const taskRouter = Router({ mergeParams: true });

// GET /projects/:id/tasks - list tasks (any member)
taskRouter.get(
  "/",
  requireProjectMember,
  validateQuery(listTasksQuerySchema),
  taskController.list
);

// POST /projects/:id/tasks - create task (OWNER, ADMIN, MEMBER)
taskRouter.post(
  "/",
  requireProjectRole(["OWNER", "ADMIN", "MEMBER"]),
  validateBody(createTaskSchema),
  taskController.create
);

// GET /projects/:id/tasks/:taskId - get task (any member)
taskRouter.get("/:taskId", requireProjectMember, taskController.get);

// PATCH /projects/:id/tasks/:taskId - update task (OWNER, ADMIN, MEMBER)
taskRouter.patch(
  "/:taskId",
  requireProjectRole(["OWNER", "ADMIN", "MEMBER"]),
  validateBody(updateTaskSchema),
  taskController.update
);

// DELETE /projects/:id/tasks/:taskId - delete task (OWNER, ADMIN)
taskRouter.delete(
  "/:taskId",
  requireProjectRole(["OWNER", "ADMIN"]),
  taskController.delete
);
