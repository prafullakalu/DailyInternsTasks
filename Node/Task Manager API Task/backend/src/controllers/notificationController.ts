import type { Response } from 'express';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/authMiddleware';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const notifications = await notificationService.listRecent(req.userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load notifications' });
  }
};
