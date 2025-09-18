import { PrismaClient } from '../generated/prisma';
import { CitaInput } from '../types/cita-input';

const prisma = new PrismaClient();

export const AgendaService = {
  async list(tenantId: string) {
    return prisma.cita.findMany({
      where: { tenantId },
      orderBy: { fecha: 'asc' },
    });
  },

  async create(tenantId: string, data: CitaInput) {
    // Verificar solapamiento
    const existe = await prisma.cita.findFirst({
      where: {
        tenantId,
        fecha: new Date(data.fecha),
      },
    });
    if (existe) throw new Error('slot-ocupado');

    return prisma.cita.create({
      data: {
        tenantId,
        cliente: data.cliente,
        telefono: data.telefono,
        email: data.email ?? null,
        servicio: data.servicio,
        fecha: new Date(data.fecha),
        duracion: data.duracion ?? 30,
        estado: (data.estado as any) ?? 'PENDIENTE', // 👈 forzamos a enum
        notas: data.notas ?? null,
      },
    });
  },

  async update(tenantId: string, id: string, data: Partial<CitaInput>) {
    const existe = await prisma.cita.findFirst({ where: { id, tenantId } });
    if (!existe) throw new Error('no-encontrada');

    return prisma.cita.update({
      where: { id },
      data: {
        cliente: data.cliente ?? existe.cliente,
        telefono: data.telefono ?? existe.telefono,
        email: data.email ?? existe.email,
        servicio: data.servicio ?? existe.servicio,
        fecha: data.fecha ? new Date(data.fecha) : existe.fecha,
        duracion: data.duracion ?? existe.duracion,
        estado: (data.estado as any) ?? existe.estado, // 👈 aquí también
        notas: data.notas ?? existe.notas,
      },
    });
  },

  async remove(tenantId: string, id: string) {
    const existe = await prisma.cita.findFirst({ where: { id, tenantId } });
    if (!existe) throw new Error('no-encontrada');

    await prisma.cita.delete({ where: { id } });
    return true;
  },
};
