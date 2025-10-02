import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export function requireAuth(roles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token =
      (req as any).cookies?.token ||
      req.headers['authorization']?.toString().split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const decoded: any = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    (req as any).user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
    }

    return next(); // ✅ añadimos return para que todos los caminos devuelvan algo
  };
}
