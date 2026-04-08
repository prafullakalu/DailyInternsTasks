import { commentRepository } from '../repositories/commentRepository';

export const commentService = {
  listByTask(taskId: string) {
    return commentRepository.listByTask(taskId);
  },

  create(data: { taskId: string; userId: string; content: string }) {
    return commentRepository.create(data);
  },
};
