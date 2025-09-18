import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  const msg = typeof err?.message === 'string' ? err.message : 'internal-error';
  res.status(400).json({ ok: false, error: msg });
}
