import type { Request, Response } from 'express';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { taskService } from '../services/taskService';
import { taskRepository } from '../repositories/taskRepository';
import { formatTaskResponse } from '../utils/taskFormatter';

type AuthRequest = Request & { userId?: string };

const normalizeEnum = <T extends string>(value: string | undefined, allowed: Set<string>, fallback: T): T | null => {
  if (!value) return fallback;
  const candidate = value.trim().toUpperCase().replace(/[\s-]+/g, '_') as T;
  return allowed.has(candidate) ? candidate : null;
};

const statusValues = new Set<string>(Object.values(TaskStatus));
const priorityValues = new Set<string>(Object.values(TaskPriority));

const parseDueDate = (value?: string | null): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const requireUser = (req: AuthRequest, res: Response): string | null => {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return req.userId;
};

const resolveId = (id: string | string[] | undefined): string | null => {
  if (!id) return null;
  return Array.isArray(id) ? id[0] : id;
};

export const listTasks = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  try {
    const tasks = await taskService.list({ userId, ...req.query });
    res.json(tasks.map(formatTaskResponse));
  } catch (error) {
    if ((error as Error).message.includes('invalid status')) {
      return res.status(422).json({ error: 'Invalid status value' });
    }
    if ((error as Error).message.includes('invalid priority')) {
      return res.status(422).json({ error: 'Invalid priority value' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveId(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }

  const task = await taskService.get(taskId);
  if (!task || task.userId !== userId) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(formatTaskResponse(task));
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const { title, description, status, priority, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const resolvedStatus = normalizeEnum<TaskStatus>(status, statusValues, TaskStatus.TODO);
  if (!resolvedStatus) return res.status(422).json({ error: 'Invalid status value' });

  const resolvedPriority = normalizeEnum<TaskPriority>(priority, priorityValues, TaskPriority.MEDIUM);
  if (!resolvedPriority) return res.status(422).json({ error: 'Invalid priority value' });

  const parsedDueDate = parseDueDate(dueDate);
  if (dueDate && parsedDueDate === null) {
    return res.status(422).json({ error: 'Invalid due date' });
  }

  try {
    const task = await taskService.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      status: resolvedStatus,
      priority: resolvedPriority,
      dueDate: parsedDueDate,
      userId,
    });
    const enriched = await taskRepository.findById(task.id);
    if (!enriched) {
      return res.status(500).json({ error: 'Unable to load task metadata' });
    }
    res.status(201).json(formatTaskResponse(enriched));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveId(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }

  const task = await taskService.get(taskId);
  if (!task || task.userId !== userId) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updates: any = {};
  const { title, description, status, priority, dueDate } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description ? description.trim() : null;
  }

  if (status !== undefined) {
    const resolvedStatus = normalizeEnum<TaskStatus>(status, statusValues, TaskStatus.TODO);
    if (!resolvedStatus) {
      return res.status(422).json({ error: 'Invalid status value' });
    }
    updates.status = resolvedStatus;
  }

  if (priority !== undefined) {
    const resolvedPriority = normalizeEnum<TaskPriority>(priority, priorityValues, TaskPriority.MEDIUM);
    if (!resolvedPriority) {
      return res.status(422).json({ error: 'Invalid priority value' });
    }
    updates.priority = resolvedPriority;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
    const parsedDueDate = parseDueDate(dueDate);
    if (dueDate && parsedDueDate === null) {
      return res.status(422).json({ error: 'Invalid due date' });
    }
    updates.dueDate = parsedDueDate;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  try {
    await taskService.update(taskId, updates);
    const enriched = await taskRepository.findById(taskId);
    if (!enriched) {
      return res.status(500).json({ error: 'Unable to load task metadata' });
    }
    res.json(formatTaskResponse(enriched));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveId(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }

  const task = await taskService.get(taskId);
  if (!task || task.userId !== userId) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    await taskService.remove(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
