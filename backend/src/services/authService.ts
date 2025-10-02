import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env['JWT_SECRET'] || 'supersecret';

export const AuthService = {
  generateToken(user: User) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
};
