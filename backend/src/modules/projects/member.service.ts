// src/modules/projects/member.service.ts
import { prisma } from "../../db/prismaClient";
import { ProjectRole } from "@prisma/client";

export const memberService = {
  async listMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async addMember(
    projectId: string,
    userId: string,
    role: ProjectRole = ProjectRole.MEMBER
  ) {
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error: any = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (existingMember) {
      const error: any = new Error("User is already a member of this project");
      error.status = 409;
      error.code = "MEMBER_EXISTS";
      throw error;
    }

    // Cannot add someone as OWNER
    if (role === ProjectRole.OWNER) {
      const error: any = new Error("Cannot add member with OWNER role");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async updateMemberRole(
    projectId: string,
    targetUserId: string,
    newRole: ProjectRole,
    actorRole: ProjectRole
  ) {
    // Get target member
    const targetMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });

    if (!targetMember) {
      const error: any = new Error("Member not found");
      error.status = 404;
      error.code = "MEMBER_NOT_FOUND";
      throw error;
    }

    // Cannot change OWNER role
    if (targetMember.role === ProjectRole.OWNER) {
      const error: any = new Error("Cannot change owner's role");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Cannot set role to OWNER
    if (newRole === ProjectRole.OWNER) {
      const error: any = new Error("Cannot set role to OWNER");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    // ADMIN cannot change another ADMIN's role
    if (
      actorRole === ProjectRole.ADMIN &&
      targetMember.role === ProjectRole.ADMIN
    ) {
      const error: any = new Error("Admin cannot change another admin's role");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    return prisma.projectMember.update({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async removeMember(
    projectId: string,
    targetUserId: string,
    actorUserId: string,
    actorRole: ProjectRole
  ) {
    // Get target member
    const targetMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });

    if (!targetMember) {
      const error: any = new Error("Member not found");
      error.status = 404;
      error.code = "MEMBER_NOT_FOUND";
      throw error;
    }

    // Cannot remove project owner
    if (targetMember.role === ProjectRole.OWNER) {
      const error: any = new Error("Cannot remove project owner");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Members can remove themselves
    const isSelfRemoval = actorUserId === targetUserId;

    // Non-owner/admin cannot remove others
    if (
      !isSelfRemoval &&
      actorRole !== ProjectRole.OWNER &&
      actorRole !== ProjectRole.ADMIN
    ) {
      const error: any = new Error("Insufficient permissions");
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });

    return { message: "Member removed" };
  },
};
