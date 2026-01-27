// src/modules/projects/project.repo.ts
import { prisma } from "../../db/prismaClient";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsParams,
} from "./project.types";
import { Prisma, ProjectRole } from "@prisma/client";

export const projectRepo = {
  async findPaginated(userId: string, params: ListProjectsParams) {
    const { page, pageSize, status, search } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
      members: {
        some: { userId },
      },
      ...(status && { status }),
      ...(search &&
        search.trim().length > 0 && {
          name: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
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
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  },

  async create(ownerId: string, data: CreateProjectInput) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          description: data.description,
          status: data.status,
          ownerId,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: ownerId,
          role: ProjectRole.OWNER,
        },
      });

      return project;
    });
  },

  async update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  },

  async getUserRole(projectId: string, userId: string) {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    return member?.role ?? null;
  },
};
