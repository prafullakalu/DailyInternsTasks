import prisma from '../prismaClient';

export const attachmentRepository = {
  findByTask(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.attachment.findUnique({ where: { id } });
  },

  create(data: { taskId: string; userId: string; url: string; filename: string; size: number }) {
    return prisma.attachment.create({ data });
  },

  delete(id: string) {
    return prisma.attachment.delete({ where: { id } });
  },
};
