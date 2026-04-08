import type { Response } from 'express';
import { tagService } from '../services/tagService';
import { taskRepository } from '../repositories/taskRepository';
import { formatTaskResponse } from '../utils/taskFormatter';
import { AuthRequest } from '../middleware/authMiddleware';

const isValidName = (value?: string | null) => !!value && value.trim().length >= 2;

const requireUser = (req: AuthRequest, res: Response): string | null => {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return req.userId;
};

const resolveParam = (value: string | string[] | undefined): string | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
};

const authorizeTask = async (taskId: string, userId: string) => {
  const task = await taskRepository.findById(taskId);
  if (!task || task.userId !== userId) {
    return null;
  }
  return task;
};

export const listTags = async (_req: AuthRequest, res: Response) => {
  try {
    const tags = await tagService.list();
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to list tags' });
  }
};

export const createTag = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!isValidName(name)) {
    return res.status(400).json({ error: 'Tag name must be at least 2 characters.' });
  }
  try {
    const tag = await tagService.create(name);
    res.status(201).json(tag);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Unable to create tag' });
  }
};

export const assignTagToTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const { tagId, tagName } = req.body;
  if (!tagId && !tagName) {
    return res.status(400).json({ error: 'Tag id or tag name is required' });
  }
  if (tagName && !isValidName(tagName)) {
    return res.status(400).json({ error: 'Tag name must be at least 2 characters.' });
  }

  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  let resolvedTag = null;
  if (tagId) {
    resolvedTag = await tagService.getById(tagId);
  } else if (tagName) {
    resolvedTag = await tagService.getOrCreate(tagName);
  }
  if (!resolvedTag) {
    return res.status(404).json({ error: 'Tag not found' });
  }

  try {
    // assignTag returns null when duplicate; still return the current task state
    await tagService.assignTag(taskId, resolvedTag.id);
    const enrichedTask = await taskRepository.findById(taskId);
    if (!enrichedTask) {
      return res.status(500).json({ error: 'Failed to reload task' });
    }
    res.json(formatTaskResponse(enrichedTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to assign tag' });
  }
};

export const removeTagFromTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const tagId = resolveParam(req.params.tagId);
  if (!tagId) {
    return res.status(400).json({ error: 'Tag id is required' });
  }

  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    await tagService.removeTag(taskId, tagId);
    const enrichedTask = await taskRepository.findById(taskId);
    if (!enrichedTask) {
      return res.status(500).json({ error: 'Failed to reload task' });
    }
    res.json(formatTaskResponse(enrichedTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to remove tag' });
  }
};

export const listTasksForTag = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const tagId = resolveParam(req.params.tagId);
  if (!tagId) {
    return res.status(400).json({ error: 'Tag id is required' });
  }

  try {
    const tasks = await tagService.listTasks(tagId);
    const filtered = tasks
      .filter((task) => task.userId === userId)
      .map(formatTaskResponse);
    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to list tasks for tag' });
  }
};
