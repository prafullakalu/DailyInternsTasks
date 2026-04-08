import prisma from '../prismaClient';

export const tagRepository = {
  create(name: string) {
    return prisma.tag.create({
      data: { name },
    });
  },

  findByName(name: string) {
    return prisma.tag.findUnique({ where: { name } });
  },

  findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  },

  list() {
    return prisma.tag.findMany({ orderBy: { name: 'asc' } });
  },

  assignToTask(taskId: string, tagId: string) {
    return prisma.taskTag.create({
      data: {
        taskId,
        tagId,
      },
    });
  },

  removeFromTask(taskId: string, tagId: string) {
    return prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });
  },

  listTasksByTag(tagId: string) {
    return prisma.task.findMany({
      where: {
        tags: {
          some: { tagId },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        attachments: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },
};
