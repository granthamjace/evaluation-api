// src/modules/projects/project.router.ts
import { Router } from "express";
import { projectController } from "./project.controller";
import { validateBody, validateQuery } from "../../middlewares/validation";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
} from "./project.validation";
import { requireAuth } from "../../middlewares/authGuard";

export const projectRouter = Router();

// All routes require authentication
projectRouter.use(requireAuth);

// GET /projects
projectRouter.get(
  "/",
  validateQuery(listProjectsQuerySchema),
  projectController.list
);

// POST /projects
projectRouter.post("/", validateBody(createProjectSchema), projectController.create);

// GET /projects/:id
projectRouter.get("/:id", projectController.get);

// PATCH /projects/:id
projectRouter.patch(
  "/:id",
  validateBody(updateProjectSchema),
  projectController.update
);

// DELETE /projects/:id
projectRouter.delete("/:id", projectController.delete);
