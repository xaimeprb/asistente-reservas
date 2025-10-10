import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

type CreateTenantInput = {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  defaultService?: string | null;
  tipoNegocio?: string | null;
};

type UpdateTenantInput = Partial<CreateTenantInput>;

const TENANT_SELECT = {
  id: true,
  nombre: true,
  slug: true,
  direccion: true,
  telefono: true,
  email: true,
  defaultService: true, // 👈 siempre devolver este campo
  tipoNegocio: true,    // 👈 y este
  createdAt: true,
  updatedAt: true,
} as const;

export const TenantService = {
  async list() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: TENANT_SELECT,
    });
  },

  async getById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      select: TENANT_SELECT,
    });
  },

  async getBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
      select: TENANT_SELECT,
    });
  },

  async create(data: CreateTenantInput) {
    // Generar slug legible y único
    let baseSlug = slugify(data.nombre, { lower: true, strict: true });
    if (!baseSlug) baseSlug = `negocio-${Date.now()}`;

    let slug = baseSlug;
    let i = 1;
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    try {
      const tenant = await prisma.tenant.create({
        data: {
          nombre: data.nombre,
          slug,
          direccion: data.direccion ?? null,
          telefono: data.telefono ?? null,
          email: data.email ?? null,
          // 👇 valores por defecto si no vienen
          defaultService: data.defaultService ?? 'Consulta general',
          tipoNegocio: data.tipoNegocio ?? 'general',
        },
        select: TENANT_SELECT,
      });
      return tenant;
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new Error('tenant-existe');
      }
      throw e;
    }
  },

  async update(id: string, data: UpdateTenantInput) {
    try {
      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          nombre: data.nombre ?? undefined,
          direccion: data.direccion ?? undefined,
          telefono: data.telefono ?? undefined,
          email: data.email ?? undefined,
          defaultService: data.defaultService ?? undefined,
          tipoNegocio: data.tipoNegocio ?? undefined,
        },
        select: TENANT_SELECT,
      });
      return tenant;
    } catch (e: any) {
      if (e?.code === 'P2025') {
        throw new Error('tenant-no-existe');
      }
      throw e;
    }
  },

  async remove(id: string) {
    try {
      await prisma.tenant.delete({ where: { id } });
      return true;
    } catch (e: any) {
      if (e?.code === 'P2025') {
        throw new Error('tenant-no-existe');
      }
      throw e;
    }
  },
};
