import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

export const TenantService = {
  async list() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    return prisma.tenant.findUnique({ where: { id } });
  },

  async getBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  },

  async create(data: { nombre: string; direccion?: string; telefono?: string; email?: string }) {
    try {
      // Generar slug legible y único
      let baseSlug = slugify(data.nombre, { lower: true, strict: true });
      let slug = baseSlug;
      let i = 1;

      // Si ya existe, añadir sufijo incremental
      while (await prisma.tenant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${i++}`;
      }

      const tenant = await prisma.tenant.create({
        data: {
          nombre: data.nombre,
          slug,
          direccion: data.direccion ?? null,
          telefono: data.telefono ?? null,
          email: data.email ?? null,
        },
      });

      return tenant;
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new Error('tenant-existe');
      }
      throw e;
    }
  },

  async remove(id: string) {
    try {
      await prisma.tenant.delete({ where: { id } });
      return true;
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new Error('tenant-no-existe');
      }
      throw e;
    }
  },
};
