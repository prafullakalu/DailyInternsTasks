import { TaskPriority, TaskStatus } from '@prisma/client';
import { taskRepository } from '../repositories/taskRepository';

type FilterValue<T extends string> = T | undefined | null;

const normalizeValue = <T extends string>(value: string | undefined | null, allowed: Set<T>, fallback: T): T | null => {
  if (!value) return fallback;
  const candidate = value.trim().toUpperCase().replace(/[\s-]+/g, '_') as T;
  return allowed.has(candidate) ? candidate : null;
};

const statusValues = new Set<TaskStatus>(Object.values(TaskStatus));
const priorityValues = new Set<TaskPriority>(Object.values(TaskPriority));

export const taskService = {
  list(filters: { status?: string; priority?: string } & { userId: string }) {
    const { status, priority, userId } = filters;
    const where: Record<string, any> = { userId };

    if (status) {
      const resolved = normalizeValue<TaskStatus>(status, statusValues, TaskStatus.TODO);
      if (!resolved) throw new Error('invalid status');
      where.status = resolved;
    }

    if (priority) {
      const resolved = normalizeValue<TaskPriority>(priority, priorityValues, TaskPriority.MEDIUM);
      if (!resolved) throw new Error('invalid priority');
      where.priority = resolved;
    }

    return taskRepository.findMany(where);
  },

  get(id: string) {
    return taskRepository.findById(id);
  },

  create(data: {
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
    userId: string;
  }) {
    return taskRepository.create(data);
  },

  update(id: string, payload: Partial<{ title: string; description: string | null; status: TaskStatus; priority: TaskPriority; dueDate?: Date | null }>) {
    return taskRepository.update(id, payload);
  },

  remove(id: string) {
    return taskRepository.delete(id);
  },
};
