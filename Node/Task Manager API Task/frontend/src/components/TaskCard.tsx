import React from 'react';
import { CheckCircle, Circle, Trash2, Pencil } from 'lucide-react';

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
  tags?: { id: string; name: string }[];
  attachmentsCount?: number;
  attachments?: { id: string; filename: string; url: string; size: number }[];
  comments?: { id: string; content: string; reactions: { id: string; type: string; userId: string }[] }[];
}

const statusBadge: Record<string, string> = {
  TODO: 'badge badge-todo',
  IN_PROGRESS: 'badge badge-progress',
  DONE: 'badge badge-done',
};

const priorityBadge: Record<string, string> = {
  LOW: 'badge badge-low',
  MEDIUM: 'badge badge-medium',
  HIGH: 'badge badge-high',
};

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onChangeStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <article
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <div className="task-card-title">
          <button type="button" onClick={() => onChangeStatus(task)} className="status-toggle">
            {task.status === 'DONE' ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <div>
            <h3>{task.title}</h3>
            <div>
              <span className={statusBadge[task.status]}>{task.status.replace('_', ' ')}</span>
              <span className={priorityBadge[task.priority]}>{task.priority}</span>
              <span className="badge badge-date">
                Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="task-card-actions">
          <button type="button" onClick={() => onEdit(task)} className="edit-btn">
            <Pencil size={16} />
          </button>
          <button type="button" onClick={() => onDelete(task.id)} className="delete-btn">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {task.description && <p className="muted">{task.description}</p>}
      {task.tags && task.tags.length ? (
        <div className="tags-row">
          {task.tags.map((tag) => (
            <span key={tag.id} className="tag-chip">
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
      {typeof task.attachmentsCount === 'number' && task.attachmentsCount > 0 && (
        <p className="task-meta">Attachments: {task.attachmentsCount}</p>
      )}
      <p className="task-meta">
        Created on {new Date(task.createdAt).toLocaleDateString()}
      </p>
    </article>
  );
};

export default TaskCard;
