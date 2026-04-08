import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
} from 'lucide-react';
import TaskService from '../services/taskService';
import type { TaskFilters } from '../services/taskService';
import KanbanColumn from '../components/KanbanColumn';
import type { Task, TaskStatusValue } from '../components/TaskCard';
import { useTaskModalContext } from '../context/taskModal';
import { NotificationService, type NotificationItem } from '../services/notificationService';

const statusOrder: TaskStatusValue[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? `${h}h ` : ''}${String(m).padStart(2, '0')}m:${String(s).padStart(2, '0')}s`;
};

const Dashboard: React.FC = () => {
  const { openEditModal } = useTaskModalContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [helperMessage, setHelperMessage] = useState('');
  const [draggedOverStatus, setDraggedOverStatus] = useState<TaskStatusValue | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTrackTaskId, setActiveTrackTaskId] = useState<string | null>(null);
  const [trackingSeconds, setTrackingSeconds] = useState(0);
  const [elapsedMap, setElapsedMap] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('organizo:timers');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [isTracking, setIsTracking] = useState(false);

  const columnDefinitions = [
    { status: 'TODO' as TaskStatusValue, title: 'To do', description: 'Fresh ideas and backlog' },
    { status: 'IN_PROGRESS' as TaskStatusValue, title: 'In progress', description: 'Work that is happening now' },
    { status: 'DONE' as TaskStatusValue, title: 'Done', description: 'Shipped or verified work' },
  ];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TaskService.list(filters);
      setTasks(response.data);
      const notifRes = await NotificationService.list();
      setNotifications(notifRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('organizo:tasks-updated', handleUpdate);
    return () => window.removeEventListener('organizo:tasks-updated', handleUpdate);
  }, [fetchTasks]);

  useEffect(() => {
    const handleMessage = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) {
        setHelperMessage(detail);
      }
    };
    window.addEventListener('organizo:task-message', handleMessage);
    return () => window.removeEventListener('organizo:task-message', handleMessage);
  }, []);

  const handleEdit = (task: Task) => {
    openEditModal(task);
    setHelperMessage('Editing existing task');
  };

  const changeStatus = async (task: Task) => {
    const current = statusOrder.indexOf(task.status);
    const next = statusOrder[(current + 1) % statusOrder.length];
    try {
      await TaskService.update(task.id, { status: next });
      fetchTasks();
    } catch (error) {
      console.error(error);
      setHelperMessage('Unable to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) {
      return;
    }
    try {
      await TaskService.remove(id);
      fetchTasks();
    } catch (error) {
      console.error(error);
      setHelperMessage('Unable to delete task.');
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task.id);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatusValue) => {
    e.preventDefault();
    setDraggedOverStatus(null);
    setDraggingTaskId(null);
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));

    try {
      await TaskService.update(taskId, { status });
    } catch (error) {
      console.error(error);
      setHelperMessage('Unable to move task.');
      fetchTasks();
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatusValue) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverStatus(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverStatus(null);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  const today = useMemo(() => new Date(), []);
  const monthName = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const offset = (firstDayOfMonth + 6) % 7;
  const calendarCells = useMemo(() => {
    const cells: Array<number | null> = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    return cells;
  }, [daysInMonth, offset]);

  const highlightedDays = useMemo(() => {
    const highlights = new Set<number>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const date = new Date(task.dueDate);
      if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
        highlights.add(date.getDate());
      }
    });
    return highlights;
  }, [tasks, today]);

  const getDayLabel = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return date.toLocaleDateString('default', { weekday: 'long' });
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  };

  const priorityRank: Record<Task['priority'], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  const sortedByDateAndPriority = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return priorityRank[a.priority] - priorityRank[b.priority];
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const withDates = sortedByDateAndPriority.filter(
      (task) => !!task.dueDate && task.status !== 'DONE'
    );
    return withDates.slice(0, 3);
  }, [sortedByDateAndPriority]);

  const fallbackTask = useMemo(() => {
    const active = tasks.find((task) => task.status === 'IN_PROGRESS');
    if (active) return active;
    const todo = tasks.find((task) => task.status !== 'DONE');
    return todo ?? null;
  }, [tasks]);

  const timerTask = useMemo(() => {
    if (activeTrackTaskId) {
      return tasks.find((task) => task.id === activeTrackTaskId) ?? fallbackTask;
    }
    return fallbackTask;
  }, [activeTrackTaskId, tasks, fallbackTask]);

  const inactiveTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.id !== (timerTask?.id ?? null) && task.status !== 'DONE'
      ),
    [tasks, timerTask]
  );

  useEffect(() => {
    if (!activeTrackTaskId && timerTask) {
      setActiveTrackTaskId(timerTask.id);
    }
  }, [activeTrackTaskId, timerTask]);

  useEffect(() => {
    if (timerTask?.id) {
      const existing = elapsedMap[timerTask.id] || 0;
      setTrackingSeconds(existing);
    } else {
      setTrackingSeconds(0);
      setIsTracking(false);
    }
  }, [timerTask?.id, elapsedMap]);

  useEffect(() => {
    if (!isTracking || !activeTrackTaskId) return undefined;
    const interval = setInterval(() => {
      setTrackingSeconds((prev) => {
        const next = prev + 1;
        setElapsedMap((current) => {
          const updated = { ...current, [activeTrackTaskId]: next };
          if (typeof window !== 'undefined') {
            localStorage.setItem('organizo:timers', JSON.stringify(updated));
          }
          return updated;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, activeTrackTaskId]);

  const toggleTimer = (taskId: string) => {
    if (activeTrackTaskId !== taskId) {
      setActiveTrackTaskId(taskId);
      const existing = elapsedMap[taskId] || 0;
      setTrackingSeconds(existing);
      setIsTracking(true);
      return;
    }
    setIsTracking((prev) => !prev);
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-grid">
        <article className="widget-card calendar-widget">
          <header>
            <div>
              <p className="eyebrow">{monthName} {today.getFullYear()}</p>
              <h3>
                <CalendarDays size={16} />
                Calendar
              </h3>
            </div>
            <div className="calendar-nav">
              <button type="button" aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
          </header>
          <div className="calendar-grid">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <span key={day} className="calendar-weekday">
                {day}
              </span>
            ))}
            {calendarCells.map((day, index) => (
              <span
                key={`${day || 'blank'}-${index}`}
                className={`calendar-day ${day === today.getDate() ? 'is-today' : ''} ${
                  day ? '' : 'is-empty'
                } ${day && highlightedDays.has(day) ? 'has-task' : ''}`}
              >
                {day || ''}
              </span>
            ))}
          </div>
          <div className="calendar-footer">
            <p>{monthName} · {tasks.length} tasks</p>
          </div>
        </article>

        <article className="widget-card tasks-widget">
          <header>
            <div>
              <p className="eyebrow">My tasks</p>
              <h3>Upcoming</h3>
            </div>
            <span className="badge badge-medium">{upcomingTasks.length ? upcomingTasks.length : '0'}</span>
          </header>
          <ul className="task-preview-list">
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => (
                <li key={task.id} className="task-preview-item">
                  <div>
                    <span className="preview-dot" />
                    <strong>{task.title}</strong>
                    <small>{getDayLabel(task.dueDate)}</small>
                  </div>
                  <span className={`preview-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </li>
              ))
            ) : (
              <li className="task-preview-item empty">No upcoming tasks yet.</li>
            )}
          </ul>
        </article>

        <article className="widget-card comments-widget">
          <header>
            <div>
              <p className="eyebrow">New comments</p>
              <h3>
                <MessageSquare size={16} />
                Activity
              </h3>
            </div>
            <span className="badge badge-soft">+ Add</span>
          </header>
          <div className="comments-stack">
            {notifications
              .filter((item) => item.type === 'comment')
              .slice(0, 4)
              .map((comment) => (
                <div key={comment.id} className="comment-row">
                  <div className="comment-dot" />
                  <div>
                    <strong>{comment.message}</strong>
                    <p>{comment.commentSnippet || 'New comment added.'}</p>
                  </div>
                </div>
              ))}
            {!notifications.filter((item) => item.type === 'comment').length && (
              <p className="muted">No new comments yet.</p>
            )}
          </div>
        </article>

        <article className="widget-card tracking-widget">
          <header>
            <div>
              <p className="eyebrow">My tracking</p>
              <h3>Timers</h3>
            </div>
            <span className="badge badge-soft">Live</span>
          </header>
          <div className="tracking-content">
            <div className="tracking-active-card">
              <div className="tracking-active-info">
                <Clock size={28} />
                <div>
                  {timerTask ? <small className="eyebrow">Live</small> : <small className="eyebrow">Idle</small>}
                  <strong>{timerTask ? timerTask.title : 'No active task'}</strong>
                  <p>
                    {timerTask ? formatDuration(trackingSeconds) : 'Start a task to begin tracking'}
                  </p>
                </div>
              </div>
              {timerTask ? (
                <button
                  type="button"
                  className={`tracking-control ${isTracking ? 'active' : 'outline'}`}
                  onClick={() => toggleTimer(timerTask.id)}
                >
                  {isTracking ? 'Pause' : 'Resume'}
                </button>
              ) : (
                <button type="button" className="tracking-control disabled" disabled>
                  Set active
                </button>
              )}
            </div>
            <div className="tracking-list">
              {inactiveTasks.length ? (
                inactiveTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="tracking-list-card">
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.status.replace('_', ' ')}</small>
                    </div>
                    <button
                      type="button"
                      className="tracking-control outline"
                      onClick={() => toggleTimer(task.id)}
                    >
                      Set active
                    </button>
                  </div>
                ))
              ) : (
                <div className="tracking-empty">
                  <p>Add more tasks to build up your tracking queue.</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>

      <div className="kanban-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Task board</p>
            <h2>Drag & drop</h2>
            <p className="muted">Modify stages, priorities, and due dates directly from the board.</p>
          </div>
          <div className="filters-row">
            <select
              value={filters.status || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value || undefined }))}
            >
              <option value="">All statuses</option>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
            <select
              value={filters.priority || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value || undefined }))}
            >
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        {helperMessage && <p className="form-helper">{helperMessage}</p>}
        <div className="kanban-board">
          {columnDefinitions.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              description={column.description}
              tasks={tasks.filter((task) => task.status === column.status)}
              isDragOver={draggedOverStatus === column.status}
              draggingTaskId={draggingTaskId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onChangeStatus={changeStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
