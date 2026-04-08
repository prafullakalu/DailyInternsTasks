import React, {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import TaskModal from '../components/TaskModal';
import TaskService from '../services/taskService';
import type { Task } from '../components/TaskCard';
import type { TaskPayload } from '../services/taskService';

export const NEW_TASK_EVENT = 'organizo:open-task-modal';

const DEFAULT_FORM_STATE: TaskPayload = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
};

interface TaskModalContextValue {
  isOpen: boolean;
  formState: TaskPayload;
  setFormState: React.Dispatch<React.SetStateAction<TaskPayload>>;
  formError: string;
  setFormError: React.Dispatch<React.SetStateAction<string>>;
  editingId: string | null;
  openModal: () => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
  handleSubmit: (event: FormEvent) => void;
}

const TaskModalContext = createContext<TaskModalContextValue>({
  isOpen: false,
  formState: DEFAULT_FORM_STATE,
  setFormState: () => {},
  formError: '',
  setFormError: () => {},
  editingId: null,
  openModal: () => {},
  openEditModal: () => {},
  closeModal: () => {},
  handleSubmit: () => {},
});

export const TaskModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<TaskPayload>({ ...DEFAULT_FORM_STATE });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setFormState({ ...DEFAULT_FORM_STATE });
    setEditingId(null);
    setFormError('');
  };

  const openModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEditModal = (task: Task) => {
    setFormState({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setEditingId(task.id);
    setFormError('');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState.title?.trim()) {
      setFormError('Please add a title.');
      return;
    }
    setFormError('');

    const payload: TaskPayload = {
      title: formState.title.trim(),
      description: formState.description?.trim(),
      status: formState.status,
      priority: formState.priority,
      dueDate: formState.dueDate || undefined,
    };

    try {
      if (editingId) {
        await TaskService.update(editingId, payload);
      } else {
        const response = await TaskService.create(payload);
        window.dispatchEvent(
          new CustomEvent('organizo:task-saved', {
            detail: { taskId: response.data.id, mode: 'create' },
          })
        );
      }
      const message = editingId ? 'Task updated.' : 'Task added.';
      window.dispatchEvent(new CustomEvent('organizo:task-message', { detail: message }));
      window.dispatchEvent(new Event('organizo:tasks-updated'));
      closeModal();
    } catch (error: any) {
      console.error(error);
      setFormError(error.response?.data?.error || 'Unable to save the task.');
    }
  };

  useEffect(() => {
    const handleNewTask = () => openModal();
    window.addEventListener(NEW_TASK_EVENT, handleNewTask);
    return () => {
      window.removeEventListener(NEW_TASK_EVENT, handleNewTask);
    };
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      formState,
      setFormState,
      formError,
      setFormError,
      editingId,
      openModal,
      openEditModal,
      closeModal,
      handleSubmit,
    }),
    [isOpen, formState, formError, editingId]
  );

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      <TaskModal
        isOpen={isOpen}
        editingId={editingId}
        formState={formState}
        setFormState={setFormState}
        onSubmit={handleSubmit}
        onClose={closeModal}
        formError={formError}
        setFormError={setFormError}
      />
    </TaskModalContext.Provider>
  );
};

export const useTaskModalContext = () => useContext(TaskModalContext);
