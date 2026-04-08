import api from './api';

export const AttachmentService = {
  list(taskId: string) {
    return api.get(`/tasks/${taskId}/attachments`);
  },

  create(taskId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove(id: string) {
    return api.delete(`/attachments/${id}`);
  },
};
