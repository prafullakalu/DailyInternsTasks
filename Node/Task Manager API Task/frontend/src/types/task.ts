export type TaskStatusValue = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriorityValue = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDate: string | null;
  createdAt: string;
}
