import api from './api';

export const TagService = {
  list() {
    return api.get('/tags');
  },

  create(name: string) {
    return api.post('/tags', { name });
  },

  assign(taskId: string, payload: { tagId?: string; tagName?: string }) {
    return api.post(`/tasks/${taskId}/tags`, payload);
  },

  remove(taskId: string, tagId: string) {
    return api.delete(`/tasks/${taskId}/tags/${tagId}`);
  },
};
