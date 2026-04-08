import { attachmentRepository } from '../repositories/attachmentRepository';

export const attachmentService = {
  listByTask(taskId: string) {
    return attachmentRepository.findByTask(taskId);
  },

  get(id: string) {
    return attachmentRepository.findById(id);
  },

  create(data: { taskId: string; userId: string; url: string; filename: string; size: number }) {
    return attachmentRepository.create(data);
  },

  remove(id: string) {
    return attachmentRepository.delete(id);
  },
};
