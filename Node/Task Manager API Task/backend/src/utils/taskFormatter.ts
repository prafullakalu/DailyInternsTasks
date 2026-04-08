export const formatTaskResponse = (task: any) => {
  const tags = task.tags?.map((relation: any) => relation.tag) ?? [];
  const attachments = task.attachments?.map((attachment: any) => ({
    id: attachment.id,
    url: attachment.url,
    filename: attachment.filename,
    size: attachment.size,
  })) ?? [];
  const comments = task.comments?.map((comment: any) => ({
    id: comment.id,
    taskId: comment.taskId,
    content: comment.content,
    reactions: comment.reactions?.map((reaction: any) => ({
      id: reaction.id,
      type: reaction.type,
      userId: reaction.userId,
    })) ?? [],
  })) ?? [];

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    userId: task.userId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    tags,
    attachments,
    attachmentsCount: attachments.length,
    comments,
  };
};
