import type { Response } from 'express';
import { attachmentService } from '../services/attachmentService';
import { taskRepository } from '../repositories/taskRepository';
import { formatTaskResponse } from '../utils/taskFormatter';
import { AuthRequest } from '../middleware/authMiddleware';

const isPositiveInt = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) && value > 0;

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

export const listAttachments = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    const attachments = await attachmentService.listByTask(taskId);
    res.json(attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to list attachments' });
  }
};

export const addAttachment = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const taskId = resolveParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ error: 'Task id is required' });
  }
  const file = (req as any).file;
  let url = '';
  let filename = '';
  let size: number;

  if (file) {
    const base = `${req.protocol}://${req.get('host')}`;
    url = `${base}/uploads/${file.filename}`;
    filename = file.originalname;
    size = file.size;
  } else {
    const bodyUrl = req.body?.url;
    const bodyFilename = req.body?.filename;
    const bodySize = Number(req.body?.size);
    if (!bodyUrl || !bodyFilename || Number.isNaN(bodySize)) {
      return res.status(400).json({ error: 'url, filename, and size are required' });
    }
    url = bodyUrl;
    filename = bodyFilename;
    size = bodySize;
  }

  if (!filename.trim()) {
    return res.status(400).json({ error: 'Filename is required' });
  }
  if (!url.trim()) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!isPositiveInt(size)) {
    return res.status(400).json({ error: 'Size must be a positive number' });
  }

  const task = await authorizeTask(taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  try {
    await attachmentService.create({
      taskId,
      userId,
      url,
      filename,
      size,
    });
    const enrichedTask = await taskRepository.findById(taskId);
    if (!enrichedTask) {
      return res.status(500).json({ error: 'Unable to load task after attachment' });
    }
    res.json(formatTaskResponse(enrichedTask));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to add attachment' });
  }
};

export const removeAttachment = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const attachmentId = resolveParam(req.params.id);
  if (!attachmentId) {
    return res.status(400).json({ error: 'Attachment id is required' });
  }
  const attachment = await attachmentService.get(attachmentId);
  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found or access denied' });
  }

  const task = await taskRepository.findById(attachment.taskId);
  if (attachment.userId !== userId && task?.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    await attachmentService.remove(attachmentId);
    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete attachment' });
  }
};
