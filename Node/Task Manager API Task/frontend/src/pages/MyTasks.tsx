import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TaskService from '../services/taskService';
import { TagService } from '../services/tagService';
import type { Task } from '../components/TaskCard';

const stageLabels: Record<string, string> = {
  TODO: 'Not started',
  IN_PROGRESS: 'In progress',
  DONE: 'Completed',
};
const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const MyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [tagFilter, setTagFilter] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await TaskService.list({});
      setTasks(response.data);
      const tagRes = await TagService.list();
      setTags(tagRes.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('organizo:tasks-updated', handleUpdate);
    return () => window.removeEventListener('organizo:tasks-updated', handleUpdate);
  }, [fetchTasks]);

  const today = useMemo(() => new Date(), []);
  const buckets = useMemo(() => {
    const groups: Record<string, Task[]> = {
      Today: [],
      Tomorrow: [],
      'This week': [],
    };

    const filtered = tagFilter
      ? tasks.filter((t) => t.tags && t.tags.some((tag) => tag.name === tagFilter))
      : tasks;

    filtered.forEach((task) => {
      if (!task.dueDate) return;
      const due = new Date(task.dueDate);
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) groups.Today.push(task);
      else if (diff === 1) groups.Tomorrow.push(task);
      else if (diff > 1 && diff <= 6) groups['This week'].push(task);
    });
    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].sort((a, b) => {
        const pa = priorityRank[a.priority as keyof typeof priorityRank];
        const pb = priorityRank[b.priority as keyof typeof priorityRank];
        if (pa !== pb) return pa - pb;
        return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
      });
    });
    return groups;
  }, [tasks, today, tagFilter]);

  const renderRows = (items: Task[]) =>
    items.map((task) => (
      <div key={task.id} className="task-row" onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer' }}>
        <div className="task-title">
          <span className="status-circle" />
          <div>
            <strong>{task.title}</strong>
            <small>{task.description || 'No description'}</small>
          </div>
        </div>
        <span className="task-cell">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span>
        <span className="task-cell">{stageLabels[task.status]}</span>
        <span className="task-cell">
          <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        </span>
        <span className="task-cell">
          {task.tags?.length ? task.tags.map((t) => t.name).join(', ') : '—'}
        </span>
        <span className="task-cell">{task.attachmentsCount ?? 0} file(s)</span>
      </div>
    ));

  return (
    <section className="my-tasks-page">
      <div className="tasks-heading">
        <div>
          <p className="eyebrow">My tasks</p>
          <h1>Priorities this week</h1>
        </div>
        <div className="filters-row">
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.entries(buckets).map(([label, items]) => (
        <div key={label} className="tasks-block">
          <div className="tasks-block-header">
            <div>
              <h2>{label}</h2>
              <p>Due {label.toLowerCase()}</p>
            </div>
            <span className="badge badge-soft">{items.length} items</span>
          </div>
          <div className="tasks-table">
            <div className="task-row header">
              <span>Task</span>
              <span>Due date</span>
              <span>Stage</span>
              <span>Priority</span>
              <span>Tags</span>
              <span>Attachments</span>
            </div>
            {items.length ? (
              renderRows(items)
            ) : (
              <div className="task-row empty">No entries for {label.toLowerCase()}.</div>
            )}
          </div>
        </div>
      ))}

      {selectedTask && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSelectedTask(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-panel-header">
              <div>
                <p className="eyebrow">Task detail</p>
                <h3>{selectedTask.title}</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedTask(null)}>
                ×
              </button>
            </div>
            <p className="muted">{selectedTask.description || 'No description'}</p>
            <div className="modal-row">
              <div className="modal-field">
                <p className="label">Due</p>
                <strong>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '—'}</strong>
              </div>
              <div className="modal-field">
                <p className="label">Priority</p>
                <strong>{selectedTask.priority}</strong>
              </div>
              <div className="modal-field">
                <p className="label">Stage</p>
                <strong>{stageLabels[selectedTask.status]}</strong>
              </div>
            </div>
            <div className="modal-section">
              <p className="label">Tags</p>
              <div className="tags-row">
                {selectedTask.tags?.length
                  ? selectedTask.tags.map((tag) => (
                      <span key={tag.id} className="tag-chip">
                        {tag.name}
                      </span>
                    ))
                  : <span className="muted">No tags</span>}
              </div>
            </div>
            <div className="modal-section">
              <p className="label">Attachments</p>
              <div className="attachments-list">
                {selectedTask.attachments?.length
                  ? selectedTask.attachments.map((att) => (
                      <div key={att.id} className="attachment-row">
                        <div>
                          <strong>{att.filename}</strong>
                          <small>{att.size} bytes</small>
                        </div>
                        <a className="link-button" href={att.url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </div>
                    ))
                  : <p className="muted">No attachments</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyTasks;
