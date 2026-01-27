// src/middlewares/projectAuth.ts
import type { Response, NextFunction } from "express";
import type { ProjectRole } from "@prisma/client";
import type { AuthenticatedRequest } from "./authGuard";
import { projectRepo } from "../modules/projects/project.repo";

export interface ProjectAuthRequest extends AuthenticatedRequest {
  projectRole?: ProjectRole;
}

export const requireProjectMember = async (
  req: ProjectAuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }

  const projectId = req.params.id;
  if (!projectId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Project ID is required",
      },
    });
  }

  const role = await projectRepo.getUserRole(projectId, req.user.id);

  if (!role) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You are not a member of this project",
      },
    });
  }

  req.projectRole = role;
  return next();
};

export const requireProjectRole = (allowedRoles: ProjectRole[]) => {
  return async (
    req: ProjectAuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Project ID is required",
        },
      });
    }

    const role = await projectRepo.getUserRole(projectId, req.user.id);

    if (!role) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not a member of this project",
        },
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });
    }

    req.projectRole = role;
    return next();
  };
};
