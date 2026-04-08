import React, { useEffect, useMemo, useState } from 'react';
import TaskService from '../services/taskService';
import { TagService } from '../services/tagService';
import { AttachmentService } from '../services/attachmentService';
import { CommentService } from '../services/commentService';
import type { TaskPayload } from '../services/taskService';

interface TaskModalProps {
  isOpen: boolean;
  editingId: string | null;
  formState: TaskPayload;
  setFormState: React.Dispatch<React.SetStateAction<TaskPayload>>;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
  formError: string;
  setFormError: React.Dispatch<React.SetStateAction<string>>;
}

interface TagItem {
  id?: string;
  name: string;
}

interface AttachmentItem {
  id: string;
  url: string;
  filename: string;
  size: number;
}

interface ReactionItem {
  id: string;
  type: string;
  userId: string;
}

interface CommentItem {
  id: string;
  taskId: string;
  content: string;
  reactions: ReactionItem[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  editingId,
  formState,
  setFormState,
  onSubmit,
  onClose,
  formError,
  setFormError,
}) => {
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [tagOptions, setTagOptions] = useState<TagItem[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attachmentsList, setAttachmentsList] = useState<AttachmentItem[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [metaLoading, setMetaLoading] = useState(false);
  const [, setTagLoading] = useState(false); // reserved for future loading UI
  const [step, setStep] = useState<'details' | 'relations'>(editingId ? 'relations' : 'details');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(editingId);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id ?? '';
      }
    } catch (error) {
      console.error(error);
    }
    return '';
  }, []);

  const currentTaskIdentifier = editingId ?? currentTaskId;
  const canEditRelations = Boolean(currentTaskIdentifier);

  const loadTagOptions = async () => {
    setTagLoading(true);
    try {
      const response = await TagService.list();
      setTagOptions(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTagLoading(false);
    }
  };

  const loadTaskMeta = async (taskId?: string) => {
    const id = taskId ?? currentTaskIdentifier;
    if (!id) return;
    setMetaLoading(true);
    try {
      const response = await TaskService.get(id);
      const data = response.data;
      setSelectedTags(data.tags ?? []);
      setAttachmentsList(data.attachments ?? []);
      setCommentsList(data.comments ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadTagOptions();
  }, [isOpen]);

  useEffect(() => {
    setCurrentTaskId(editingId);
    setStep(editingId ? 'relations' : 'details');
    if (editingId) {
      loadTaskMeta(editingId);
    }
  }, [editingId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTags([]);
      setTagInput('');
      setAttachmentsList([]);
      setAttachmentFile(null);
      setCommentsList([]);
      setCommentInput('');
      setFormError('');
    }
  }, [isOpen]);

  const payloadFromForm = () => ({
    title: formState.title.trim(),
    description: formState.description?.trim(),
    status: formState.status,
    priority: formState.priority,
    dueDate: formState.dueDate || undefined,
  });

  const applyDueInDays = (daysAhead: number) => {
    const next = new Date();
    next.setDate(next.getDate() + daysAhead);
    setFormState((prev) => ({
      ...prev,
      dueDate: next.toISOString().split('T')[0],
    }));
  };

  const handleCustomDue = () => {
    const custom = window.prompt('Enter due date (YYYY-MM-DD)');
    if (custom) {
      setFormState((prev) => ({ ...prev, dueDate: custom }));
    }
  };

  const validateDetails = (): string | null => {
    if (!formState.title || !formState.title.trim()) return 'Please add a title.';
    if (formState.title.trim().length < 3) return 'Title should be at least 3 characters.';
    if (!formState.dueDate) return 'Please select a due date.';
    const parsed = new Date(formState.dueDate);
    if (Number.isNaN(parsed.getTime())) return 'Please choose a valid due date.';
    if (!formState.priority) return 'Please choose a priority.';
    if (!formState.status) return 'Please choose a stage.';
    return null;
  };

  const handleCreateTask = async () => {
    const validationError = validateDetails();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setDetailsSaving(true);
    setFormError('');
    try {
      const response = await TaskService.create(payloadFromForm());
      setCurrentTaskId(response.data.id);
      setStep('relations');
      loadTaskMeta(response.data.id);
      window.dispatchEvent(new CustomEvent('organizo:task-message', { detail: 'Task created. Continue with relations.' }));
      window.dispatchEvent(new Event('organizo:tasks-updated'));
    } catch (error: any) {
      console.error(error);
      setFormError(error.response?.data?.error || 'Unable to create task.');
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleDetailsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step !== 'details') return;
    const validationError = validateDetails();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    if (editingId) {
      await onSubmit(event);
      return;
    }
    await handleCreateTask();
  };

  const changeStep = (target: 'details' | 'relations') => {
    if (target === 'relations' && !canEditRelations) return;
    setStep(target);
  };

  const triggerUpdateSave = () => {
    if (currentTaskIdentifier) {
      // Update existing task without creating a duplicate
      TaskService.update(currentTaskIdentifier, payloadFromForm())
        .then(() => {
          window.dispatchEvent(new CustomEvent('organizo:task-message', { detail: 'Task updated.' }));
          window.dispatchEvent(new Event('organizo:tasks-updated'));
          onClose();
        })
        .catch((error: any) => {
          console.error(error);
          setFormError(error.response?.data?.error || 'Unable to save the task.');
        });
    } else {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      onSubmit(fakeEvent);
    }
  };

  const handleAddTag = async () => {
    const taskId = currentTaskIdentifier;
    if (!taskId || !tagInput.trim()) return;
    try {
      await TagService.assign(taskId, { tagName: tagInput.trim() });
      setTagInput('');
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveTag = async (tag: TagItem) => {
    const taskId = currentTaskIdentifier;
    if (!taskId || !tag.id) return;
    try {
      await TagService.remove(taskId, tag.id);
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddAttachment = async () => {
    const taskId = currentTaskIdentifier;
    if (!taskId) return;
    if (!attachmentFile) return;
    try {
      await AttachmentService.create(taskId, attachmentFile);
      setAttachmentFile(null);
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const taskId = currentTaskIdentifier;
    if (!taskId) return;
    try {
      await AttachmentService.remove(attachmentId);
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async () => {
    const taskId = currentTaskIdentifier;
    if (!taskId || !commentInput.trim()) return;
    try {
      await CommentService.create(taskId, commentInput.trim());
      setCommentInput('');
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleReaction = async (comment: CommentItem) => {
    const taskId = comment.taskId ?? currentTaskIdentifier;
    if (!taskId) return;
    const existingReaction = comment.reactions.find((reaction) => reaction.userId === userId);
    try {
      if (existingReaction) {
        await CommentService.removeReaction(comment.id);
      } else {
        await CommentService.addReaction(comment.id, 'like');
      }
      await loadTaskMeta(taskId);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <header className="modal-panel-header">
          <div>
            <p className="eyebrow">Name of task</p>
            <h3>{editingId ? 'Update details' : 'Create new task'}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="modal-stepper">
          <button
            type="button"
            className={step === 'details' ? 'active' : ''}
            onClick={() => changeStep('details')}
          >
            1 Task details
          </button>
          <button
            type="button"
            className={step === 'relations' ? 'active' : ''}
            disabled={!canEditRelations}
            onClick={() => changeStep('relations')}
          >
            2 Relations
          </button>
        </div>

        <form className="task-modal-form" onSubmit={handleDetailsSubmit}>
          {step === 'details' && (
            <>
              <label>
                Title
                <input
                  value={formState.title}
                  onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                  placeholder="Project launch, call with client..."
                  required
                />
              </label>

              <div className="modal-row">
                <div className="modal-field">
                  <p>Day</p>
                  <div className="pill-row">
                    <button type="button" onClick={() => applyDueInDays(0)}>
                      Today
                    </button>
                    <button type="button" onClick={() => applyDueInDays(1)}>
                      Tomorrow
                    </button>
                    <button type="button" onClick={handleCustomDue}>
                      +
                    </button>
                  </div>
                  <input
                    type="date"
                    className="date-picker"
                    value={formState.dueDate}
                    onChange={(event) => setFormState({ ...formState, dueDate: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-row">
                <div className="modal-field">
                  <p>Priority</p>
                  <select
                    value={formState.priority}
                    onChange={(event) => setFormState({ ...formState, priority: event.target.value })}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="modal-field">
                  <p>Stage</p>
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState({ ...formState, status: event.target.value })}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <label className="description-field">
                Description
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                  placeholder="Share the context, links, or attachments."
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="primary" disabled={detailsSaving}>
                  {editingId ? 'Save changes' : detailsSaving ? 'Saving…' : 'Save & continue'}
                </button>
                <button type="button" className="ghost" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {step === 'relations' && (
            <>
              <div className="modal-section">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Tags</p>
                    <p className="muted">{selectedTags.length} tag(s)</p>
                  </div>
                </div>
                <div className="tag-input-row">
                  <input
                    type="text"
                    className="date-picker"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    disabled={!canEditRelations}
                  />
                  <button type="button" className="ghost" onClick={handleAddTag} disabled={!canEditRelations}>
                    Add
                  </button>
                </div>
                {tagOptions.length > 0 && (
                  <div className="tag-suggestions">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className="ghost"
                        onClick={() => {
                          setTagInput(tag.name);
                          handleAddTag();
                        }}
                        disabled={!canEditRelations}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="tags-row">
                  {selectedTags.map((tag) => (
                    <span key={`${tag.name}-${tag.id ?? 'pending'}`} className="tag-chip">
                      {tag.name}
                      <button type="button" className="ghost-pill" onClick={() => handleRemoveTag(tag)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Attachments</p>
                    <p className="muted">{attachmentsList.length} file(s)</p>
                  </div>
                </div>
                <div className="attachments-list">
                  {attachmentsList.map((attachment) => {
                    const link =
                      attachment.url && attachment.url.startsWith('http')
                        ? attachment.url
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${attachment.url}`;
                    return (
                      <div key={attachment.id} className="attachment-row">
                        <div>
                          <strong>
                            <a href={link} target="_blank" rel="noreferrer" className="link-button">
                              {attachment.filename}
                            </a>
                          </strong>
                          <small>{attachment.size} bytes</small>
                        </div>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          disabled={!canEditRelations}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  {!attachmentsList.length && <p className="muted">No attachments yet.</p>}
                </div>
                <div className="attachment-form">
                  <input
                    type="file"
                    onChange={(event) => {
                      if (event.target.files && event.target.files[0]) {
                        setAttachmentFile(event.target.files[0]);
                      }
                    }}
                    disabled={!canEditRelations}
                  />
                  <button
                    type="button"
                    className="primary"
                    onClick={handleAddAttachment}
                    disabled={!canEditRelations || !attachmentFile}
                  >
                    Upload attachment
                  </button>
                </div>
              </div>

              <div className="modal-section">
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Comments</p>
                    <p className="muted">{commentsList.length} conversation(s)</p>
                  </div>
                </div>
                <div className="comments-stack">
                  {metaLoading ? (
                    <p className="muted">Loading comments...</p>
                  ) : (
                    commentsList.map((comment) => {
                      const reacted = comment.reactions.some((reaction) => reaction.userId === userId);
                      return (
                        <div key={comment.id} className="comment-row">
                          <div>
                            <strong>{comment.content}</strong>
                            <small>
                              {comment.reactions.length} reaction{comment.reactions.length === 1 ? '' : 's'}
                            </small>
                          </div>
                          <button type="button" className="ghost" onClick={() => toggleReaction(comment)}>
                            {reacted ? 'Remove ❤️' : 'Love ❤️'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="comment-form">
                  <textarea
                    placeholder="Add a quick note"
                    value={commentInput}
                    onChange={(event) => setCommentInput(event.target.value)}
                    disabled={!canEditRelations}
                  />
                  <button
                    type="button"
                    className="primary"
                    onClick={handleAddComment}
                    disabled={!canEditRelations}
                  >
                    Add comment
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="ghost" onClick={() => changeStep('details')}>
                  Back to details
                </button>
                <button type="button" className="primary" onClick={triggerUpdateSave}>
                  Save task
                </button>
              </div>
            </>
          )}
        </form>

        {formError && <p className="form-error">{formError}</p>}
      </div>
    </div>
  );
};

export default TaskModal;
