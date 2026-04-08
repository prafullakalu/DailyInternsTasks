import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err?.status || 500;
  const message = err?.message || 'Something went wrong!';

  res.status(status).json({ error: message });
};
