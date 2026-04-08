import api from './api';

export type TaskFilters = {
  status?: string;
  priority?: string;
};

export interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

const TaskService = {
  list(filters?: TaskFilters) {
    return api.get('/tasks', { params: filters });
  },
  get(id: string) {
    return api.get(`/tasks/${id}`);
  },
  create(payload: TaskPayload) {
    return api.post('/tasks', payload);
  },
  update(id: string, payload: Partial<TaskPayload>) {
    return api.put(`/tasks/${id}`, payload);
  },
  remove(id: string) {
    return api.delete(`/tasks/${id}`);
  },
};

export default TaskService;
