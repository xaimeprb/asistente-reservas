import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Error:', err);

  if (res.headersSent) {
    return res.end(); // ✅ cerramos respuesta si ya estaba enviada
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
}
