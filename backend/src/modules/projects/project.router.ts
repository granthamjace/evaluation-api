// src/modules/projects/project.router.ts
import { Router } from "express";
import { projectController } from "./project.controller";
import { memberController } from "./member.controller";
import { validateBody, validateQuery } from "../../middlewares/validation";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./project.validation";
import { requireAuth } from "../../middlewares/authGuard";
import {
  requireProjectMember,
  requireProjectRole,
} from "../../middlewares/projectAuth";

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

// Member routes - nested under /projects/:id/members

// GET /projects/:id/members
projectRouter.get("/:id/members", requireProjectMember, memberController.list);

// POST /projects/:id/members
projectRouter.post(
  "/:id/members",
  requireProjectRole(["OWNER", "ADMIN"]),
  validateBody(addMemberSchema),
  memberController.add
);

// PATCH /projects/:id/members/:userId
projectRouter.patch(
  "/:id/members/:userId",
  requireProjectRole(["OWNER", "ADMIN"]),
  validateBody(updateMemberRoleSchema),
  memberController.updateRole
);

// DELETE /projects/:id/members/:userId
projectRouter.delete(
  "/:id/members/:userId",
  requireProjectRole(["OWNER", "ADMIN"]),
  memberController.remove
);
