import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const payload = AuthService.verifyToken(token);
    (req as any).user = payload;
    return next(); // ✅ añadimos return aquí también
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
