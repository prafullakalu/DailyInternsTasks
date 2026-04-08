import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    res.status(401).json({ error: 'Access token is missing' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey') as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
