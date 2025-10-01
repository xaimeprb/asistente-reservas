import { PrismaClient, User } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const UserService = {
  async create(
    email: string,
    password: string,
    tenantId: string,
    role: 'ADMIN' | 'SUPERADMIN' = 'ADMIN'
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: { email, passwordHash, tenantId, role },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },
};
