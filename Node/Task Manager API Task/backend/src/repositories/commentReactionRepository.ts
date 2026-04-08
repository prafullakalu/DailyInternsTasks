import prisma from '../prismaClient';

export const commentReactionRepository = {
  create(data: { commentId: string; userId: string; type: string }) {
    return prisma.commentReaction.create({
      data,
    });
  },

  findUnique(commentId: string, userId: string) {
    return prisma.commentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
  },

  deleteByCommentAndUser(commentId: string, userId: string) {
    return prisma.commentReaction.delete({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });
  },

  listByComment(commentId: string) {
    return prisma.commentReaction.findMany({
      where: { commentId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
