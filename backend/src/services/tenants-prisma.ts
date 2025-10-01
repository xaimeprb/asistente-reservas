import { PrismaClient } from '../generated/prisma';
import slugify from 'slugify';

const prisma = new PrismaClient();

export const TenantService = {
  async list() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async get(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
    });
  },

  async getBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
    });
  },

  async create(input: { nombre: string; direccion?: string; telefono?: string; email?: string }) {
    if (!input.nombre) {
      throw new Error('datos-incompletos');
    }

    try {
      // Generar slug legible y único
      let baseSlug = slugify(input.nombre, { lower: true, strict: true });
      let slug = baseSlug;
      let i = 1;

      // Si ya existe, añadir sufijo incremental
      while (await prisma.tenant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${i++}`;
      }

      const tenant = await prisma.tenant.create({
        data: {
          nombre: input.nombre,
          slug,
          direccion: input.direccion || null,
          telefono: input.telefono || null,
          email: input.email || null,
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
      await prisma.tenant.delete({
        where: { id },
      });
      return true;
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new Error('tenant-no-existe');
      }
      throw e;
    }
  },
};
