import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { NotificationService, type NotificationItem } from '../services/notificationService';
import TaskService from '../services/taskService';
import { CommentService } from '../services/commentService';
import type { Task } from '../components/TaskCard';

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const getDayLabel = (dueDate: string | null | undefined) => {
  if (!dueDate) return 'No deadline';
  const date = new Date(dueDate);
  return date.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
};

type TaskIndex = Record<string, Task>;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [tasksById, setTasksById] = useState<TaskIndex>({});
  const [tasksList, setTasksList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, tasksRes] = await Promise.all([NotificationService.list(), TaskService.list({})]);
      setNotifications(notifRes.data);
      const taskIndex: TaskIndex = {};
      tasksRes.data.forEach((t: Task) => {
        taskIndex[t.id] = t;
      });
      setTasksById(taskIndex);
      setTasksList(tasksRes.data);
      if (!selectedId && notifRes.data.length) {
        setSelectedId(notifRes.data[0].id);
      }
      if (!selectedTaskId && tasksRes.data.length) {
        setSelectedTaskId(tasksRes.data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedId, selectedTaskId]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserId(parsed?.id || '');
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const handleUpdate = () => fetchNotifications();
    window.addEventListener('organizo:tasks-updated', handleUpdate);
    return () => window.removeEventListener('organizo:tasks-updated', handleUpdate);
  }, [fetchNotifications]);

  const activeNotification = useMemo(
    () => notifications.find((item) => item.id === selectedId) || null,
    [notifications, selectedId]
  );
  const currentNotification = activeNotification || { type: 'comment', createdAt: '' as string };

  const activeTask = useMemo(() => {
    if (selectedTaskId) return tasksById[selectedTaskId] || null;
    if (activeNotification) return tasksById[activeNotification.taskId] || null;
    return null;
  }, [selectedTaskId, activeNotification, tasksById]);

  const loadComments = useCallback(async () => {
    if (!activeTask) {
      setComments([]);
      return;
    }
    try {
      const res = await CommentService.listForTask(activeTask.id);
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [activeTask]);

  useEffect(() => {
    loadComments();
  }, [activeTask, loadComments]);

  const handleAddComment = async () => {
    if (!activeTask || !newComment.trim()) return;
    try {
      await CommentService.create(activeTask.id, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    try {
      // remove previous reaction if it exists (unique per user), then add the new one
      await CommentService.removeReaction(commentId);
    } catch (error) {
      // ignore if none existed
    }
    try {
      await CommentService.addReaction(commentId, emoji);
      await loadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const detailTitle = activeNotification
    ? activeNotification.message
    : 'Select a notification or pick a task to comment';

  return (
    <section className="notifications-page">
      <div className="notifications-column">
        <header>
          <div>
            <p className="eyebrow">Latest notifications</p>
            <h1>Updates</h1>
          </div>
          <span className="badge badge-soft">
            {loading ? 'Loading' : `${notifications.length} item${notifications.length === 1 ? '' : 's'}`}
          </span>
        </header>
        <div className="notifications-list">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`notification-item ${selectedId === notification.id ? 'is-active' : ''}`}
              onClick={() => setSelectedId(notification.id)}
            >
              <div>
                <span className="status-dot" />
                <strong>{notification.message}</strong>
              </div>
              <small>{new Date(notification.createdAt).toLocaleString()}</small>
            </button>
          ))}
          {!notifications.length && !loading && (
            <div className="empty-state-card">No updates yet.</div>
          )}
        </div>
      </div>

      <div className="notification-detail">
        {true ? (
          <>
            <div className="detail-header">
              <div>
                <strong>{detailTitle}</strong>
                <p>{activeTask?.title || 'Pick a task to comment'}</p>
              </div>
              <button type="button" className="icon-button ghost" onClick={() => setSelectedId(null)}>
                ×
              </button>
            </div>
            <div className="detail-row">
              <div>
                <p className="label">Comment on task</p>
                <select
                  className="date-picker"
                  value={activeTask?.id || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                  {tasksList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="label">Type</p>
                <strong>{currentNotification.type || 'comment'}</strong>
              </div>
              <div>
                <p className="label">When</p>
                <strong>{currentNotification.createdAt ? new Date(currentNotification.createdAt).toLocaleString() : ''}</strong>
              </div>
              {activeTask && (
                <>
                  <div>
                    <p className="label">Deadline</p>
                    <strong>{getDayLabel(activeTask.dueDate)}</strong>
                  </div>
                  <div>
                    <p className="label">Priority</p>
                    <strong>{priorityLabels[activeTask.priority]}</strong>
                  </div>
                </>
              )}
            </div>
            {activeNotification && activeNotification.commentSnippet && (
              <div className="detail-card">
                <p className="label">Comment</p>
                <div className="empty-state-card">{activeNotification.commentSnippet}</div>
              </div>
            )}
            {activeNotification && activeNotification.fileName && (
              <div className="detail-card">
                <p className="label">Attachment</p>
                <div className="empty-state-card">{activeNotification.fileName}</div>
              </div>
            )}
            <div className="detail-card">
              <p className="label">Comments</p>
              <div className="comments-stack" style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {comments.map((c) => (
                  <div key={c.id} className="comment-row">
                    <div className="comment-dot" />
                    <div>
                      <strong>{c.content}</strong>
                      <p className="muted">{c.reactions?.length || 0} reaction{(c.reactions?.length || 0) === 1 ? '' : 's'}</p>
                      <div className="pill-row">
                        {['❤️', '👍', '😂'].map((emoji) => {
                          const counts = c.reactions?.filter((r: any) => r.type === emoji).length || 0;
                          const isMine = c.reactions?.some((r: any) => r.userId === userId && r.type === emoji);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              className={`ghost ${isMine ? 'active' : ''}`}
                              onClick={() => toggleReaction(c.id, emoji)}
                              aria-pressed={isMine}
                            >
                              {emoji} {counts > 0 ? counts : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {!comments.length && <p className="muted">No comments yet.</p>}
              </div>
              <div className="comment-form">
                <textarea
                  placeholder="Add a quick note"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button type="button" className="ghost" onClick={() => setShowEmojiPicker((prev) => !prev)}>
                    Add emoji
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={handleAddComment}
                    aria-disabled={!newComment.trim()}
                    style={{ opacity: newComment.trim() ? 1 : 0.55 }}
                  >
                    Add comment
                  </button>
                </div>
                {showEmojiPicker && (
                  <EmojiPicker
                    onEmojiClick={(data) => {
                      // data.emoji is available on v4
                      // @ts-ignore
                      setNewComment((prev) => `${prev} ${data.emoji}`.trim());
                      setShowEmojiPicker(false);
                    }}
                    width="100%"
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state-card">Select a notification to view the details.</div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
