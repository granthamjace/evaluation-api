// src/modules/projects/member.controller.ts
import type { Response, NextFunction } from "express";
import { memberService } from "./member.service";
import type { ProjectAuthRequest } from "../../middlewares/projectAuth";

export const memberController = {
  async list(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const members = await memberService.listMembers(projectId);

      res.json({ success: true, data: members });
    } catch (err) {
      next(err);
    }
  },

  async add(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const { userId, role } = req.body;

      const member = await memberService.addMember(projectId, userId, role);

      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const targetUserId = req.params.userId;
      const { role } = req.body;
      const actorRole = req.projectRole!;

      const member = await memberService.updateMemberRole(
        projectId,
        targetUserId,
        role,
        actorRole
      );

      res.json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: ProjectAuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const targetUserId = req.params.userId;
      const actorUserId = req.user!.id;
      const actorRole = req.projectRole!;

      const result = await memberService.removeMember(
        projectId,
        targetUserId,
        actorUserId,
        actorRole
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
