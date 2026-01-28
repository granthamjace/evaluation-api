// src/modules/projects/task.repo.ts
import { prisma } from "../../db/prismaClient";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksParams,
} from "./task.types";
import { Prisma } from "@prisma/client";

export const taskRepo = {
  async findPaginated(projectId: string, params: ListTasksParams) {
    const { page, pageSize, status, priority, assigneeId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(search &&
        search.trim().length > 0 && {
          title: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
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
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
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

  async findByProjectAndTitle(projectId: string, title: string) {
    return prisma.task.findUnique({
      where: {
        projectId_title: {
          projectId,
          title,
        },
      },
    });
  },

  async create(projectId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
      },
      include: {
        assignee: {
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

  async update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
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

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  },
};
