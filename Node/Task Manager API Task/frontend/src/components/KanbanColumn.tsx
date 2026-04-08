import React from 'react';
import { CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';
import type { Task, TaskStatusValue } from '../types/task';

interface KanbanColumnProps {
  status: TaskStatusValue;
  title: string;
  description: string;
  tasks: Task[];
  isDragOver: boolean;
  draggingTaskId: string | null;
  onDragStart: (event: React.DragEvent, task: Task) => void;
  onDrop: (event: React.DragEvent, status: TaskStatusValue) => void;
  onDragOver: (event: React.DragEvent, status: TaskStatusValue) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onChangeStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  description,
  tasks,
  isDragOver,
  draggingTaskId,
  onDragStart,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onChangeStatus,
  onEdit,
  onDelete,
}) => (
  <section
    className={`kanban-column ${isDragOver ? 'is-active' : ''}`}
    onDragOver={(event) => onDragOver(event, status)}
    onDrop={(event) => onDrop(event, status)}
    onDragLeave={onDragLeave}
  >
    <header>
      <div>
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
      <span className="kanban-count">{tasks.length}</span>
    </header>
    <div className="kanban-cards">
      {tasks.length === 0 ? (
        <p className="muted">No tasks</p>
      ) : (
        tasks.map((task) => (
          <article
            key={task.id}
            className="task-card"
            draggable
            onDragStart={(event) => onDragStart(event, task)}
            onDragEnd={onDragEnd}
            aria-roledescription="Draggable task card"
          >
            <div className="task-card-top">
              <div className="task-card-title">
                <button
                  type="button"
                  onClick={() => onChangeStatus(task)}
                  className="status-toggle"
                  aria-label="Toggle task status"
                >
                  {task.status === 'DONE' ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div>
                  <h3>{task.title}</h3>
                  <div>
                    <span className={`badge badge-${task.status === 'TODO' ? 'todo' : task.status === 'IN_PROGRESS' ? 'progress' : 'done'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <span className="badge badge-date">
                      Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-card-actions">
                <button type="button" onClick={() => onEdit(task)}>
                  <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                </button>
                <button type="button" onClick={() => onDelete(task.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {task.description && <p className="task-description">{task.description}</p>}
            <p className="task-meta">
              Created on {new Date(task.createdAt).toLocaleDateString()} · updated status to {task.status}
            </p>
            {draggingTaskId === task.id && <span className="drag-indicator">Dragging...</span>}
          </article>
        ))
      )}
    </div>
  </section>
);

export default KanbanColumn;
