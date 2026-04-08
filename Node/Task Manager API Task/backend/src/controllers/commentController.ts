import type { Response } from 'express';
import { commentService } from '../services/commentService';
import { taskRepository } from '../repositories/taskRepository';
import { AuthRequest } from '../middleware/authMiddleware';

const isValidContent = (value?: string | null) => !!value && value.trim().length >= 2;

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

export const listCommentsForTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.taskId);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    const comments = await commentService.listByTask(taskId);
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load comments' });
  }
};

export const createCommentForTask = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.taskId);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const { content } = req.body;
  if (!isValidContent(content)) {
    return res.status(400).json({ error: 'Comment content must be at least 2 characters.' });
  }

  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    const comment = await commentService.create({
      taskId,
      userId,
      content: content.trim(),
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to add comment' });
  }
};
