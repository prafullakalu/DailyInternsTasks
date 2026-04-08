import type { Response } from 'express';
import { userService } from '../services/userService';
import { AuthRequest } from '../middleware/authMiddleware';

const isValidName = (value?: string | null) => !!value && value.trim().length >= 2;
const isValidEmail = (value?: string | null) => !!value && /\S+@\S+\.\S+/.test(value.trim());

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await userService.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ id: user.id, name: user.name, email: user.email });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

  const { name, email } = req.body;
  if (name !== undefined && !isValidName(name)) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (email !== undefined && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'Nothing to update.' });
  }

  try {
    const updated = await userService.update(req.userId, {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
    });
    res.json({ id: updated.id, name: updated.name, email: updated.email });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to update profile' });
  }
};
