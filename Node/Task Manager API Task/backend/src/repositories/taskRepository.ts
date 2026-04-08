import { TaskPriority, TaskStatus } from '@prisma/client';
import prisma from '../prismaClient';

export const taskRepository = {
  findMany(where: Record<string, any>) {
    return prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        attachments: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            reactions: true,
          },
        },
      },
    });
  },

  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        attachments: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            reactions: true,
          },
        },
      },
    });
  },

  create(data: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
    userId: string;
  }) {
    return prisma.task.create({ data });
  },

  update(id: string, payload: Partial<{ title: string; description: string | null; status: TaskStatus; priority: TaskPriority; dueDate?: Date | null }>) {
    return prisma.task.update({
      where: { id },
      data: payload,
    });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
