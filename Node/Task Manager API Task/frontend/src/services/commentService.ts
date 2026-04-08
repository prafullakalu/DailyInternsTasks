import api from './api';

export const CommentService = {
  listForTask(taskId: string) {
    return api.get(`/comments/tasks/${taskId}/comments`);
  },

  create(taskId: string, content: string) {
    return api.post(`/comments/tasks/${taskId}/comments`, { content });
  },

  addReaction(commentId: string, type: string) {
    return api.post(`/comments/${commentId}/reactions`, { type });
  },

  removeReaction(commentId: string) {
    return api.delete(`/comments/${commentId}/reactions`);
  },
};
