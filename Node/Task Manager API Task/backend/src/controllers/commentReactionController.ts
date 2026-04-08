import type { Response } from 'express';
import { commentReactionService } from '../services/commentReactionService';
import { commentRepository } from '../repositories/commentRepository';
import { AuthRequest } from '../middleware/authMiddleware';

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

const isValidType = (value?: string | null) => !!value && value.trim().length >= 1 && value.trim().length <= 32;

const authorizeComment = async (commentId: string) => {
  return commentRepository.findById(commentId);
};

export const addReaction = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const commentId = resolveParam(req.params.commentId);
  if (!commentId) {
    return res.status(400).json({ error: 'Comment id is required' });
  }
  const { type } = req.body;
  if (!isValidType(type)) {
    return res.status(400).json({ error: 'Reaction type is required (max 32 chars).' });
  }

  const comment = await authorizeComment(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  try {
    const reaction = await commentReactionService.create({
      commentId,
      userId,
      type: type.trim(),
    });
    res.status(201).json(reaction);
  } catch (error: any) {
    if (error.code === 'P2002') {
      const existing = await commentReactionService.findForUser(commentId, userId);
      return res.status(200).json(existing);
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to add reaction' });
  }
};

export const removeReaction = async (req: AuthRequest, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const commentId = resolveParam(req.params.commentId);
  if (!commentId) {
    return res.status(400).json({ error: 'Comment id is required' });
  }

  const comment = await authorizeComment(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  try {
    await commentReactionService.remove(commentId, userId);
    res.json({ message: 'Reaction removed' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Reaction not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to remove reaction' });
  }
};
