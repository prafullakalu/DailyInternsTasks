import api from './api';

export interface NotificationItem {
  id: string;
  type: 'comment' | 'attachment' | 'reaction';
  taskId: string;
  message: string;
  createdAt: string;
  fileName?: string;
  commentSnippet?: string;
  reactionType?: string;
}

export const NotificationService = {
  list() {
    return api.get<NotificationItem[]>('/notifications');
  },
};
