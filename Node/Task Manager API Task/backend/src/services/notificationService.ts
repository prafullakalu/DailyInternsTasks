import prisma from '../prismaClient';

export const notificationService = {
  async listRecent(userId: string, limit = 8) {
    const [attachments, comments, reactions] = await Promise.all([
      prisma.attachment.findMany({
        where: {
          task: {
            userId,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { task: true, user: true },
      }),
      prisma.comment.findMany({
        where: {
          task: {
            userId,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { task: true, user: true },
      }),
      prisma.commentReaction.findMany({
        where: {
          comment: {
            task: {
              userId,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { comment: { include: { task: true } }, user: true },
      }),
    ]);

    const events = [
      ...attachments.map((attachment) => ({
        type: 'attachment',
        id: attachment.id,
        message: `${attachment.user.name} uploaded ${attachment.filename}`,
        taskId: attachment.taskId,
        createdAt: attachment.createdAt,
        fileName: attachment.filename,
      })),
      ...comments.map((comment) => ({
        type: 'comment',
        id: comment.id,
        message: `${comment.user.name} commented on ${comment.task.title}`,
        taskId: comment.taskId,
        createdAt: comment.createdAt,
        commentSnippet: comment.content,
      })),
      ...reactions.map((reaction) => ({
        type: 'reaction',
        id: reaction.id,
        message: `${reaction.user.name} reacted ${reaction.type} on ${reaction.comment.content}`,
        taskId: reaction.comment.taskId,
        createdAt: reaction.createdAt,
        reactionType: reaction.type,
      })),
    ];

    return events
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
};
