import { commentReactionRepository } from '../repositories/commentReactionRepository';

export const commentReactionService = {
  create(data: { commentId: string; userId: string; type: string }) {
    return commentReactionRepository.create(data);
  },

  findForUser(commentId: string, userId: string) {
    return commentReactionRepository.findUnique(commentId, userId);
  },

  remove(commentId: string, userId: string) {
    return commentReactionRepository.deleteByCommentAndUser(commentId, userId);
  },

  listByComment(commentId: string) {
    return commentReactionRepository.listByComment(commentId);
  },
};
