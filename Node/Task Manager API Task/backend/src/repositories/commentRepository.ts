import prisma from '../prismaClient';

export const commentRepository = {
  findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        reactions: true,
      },
    });
  },

  listByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        reactions: true,
      },
    });
  },

  create(data: { taskId: string; userId: string; content: string }) {
    return prisma.comment.create({
      data,
    });
  },
};
