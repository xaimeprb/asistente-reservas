"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.AgendaService = {
    async list(tenantId) {
        return prisma.cita.findMany({
            where: { tenantId },
            orderBy: { fecha: 'asc' },
        });
    },
    async getById(tenantId, id) {
        return prisma.cita.findFirst({ where: { id, tenantId } });
    },
    async resolveByTelefonoFecha(tenantId, telefono, fechaISO) {
        const fecha = new Date(fechaISO);
        return prisma.cita.findFirst({
            where: { tenantId, telefono, fecha },
            orderBy: { createdAt: 'desc' },
        });
    },
    async create(tenantId, data) {
        const existe = await prisma.cita.findFirst({
            where: { tenantId, fecha: new Date(data.fecha) },
        });
        if (existe)
            throw new Error('slot-ocupado');
        return prisma.cita.create({
            data: {
                tenantId,
                cliente: data.cliente,
                telefono: data.telefono,
                email: data.email ?? null,
                servicio: data.servicio,
                fecha: new Date(data.fecha),
                duracion: data.duracion ?? 30,
                estado: data.estado ?? 'PENDIENTE',
                notas: data.notas ?? null,
            },
        });
    },
    async update(tenantId, id, data) {
        const existe = await prisma.cita.findFirst({ where: { id, tenantId } });
        if (!existe)
            throw new Error('no-encontrada');
        return prisma.cita.update({
            where: { id },
            data: {
                cliente: data.cliente ?? existe.cliente,
                telefono: data.telefono ?? existe.telefono,
                email: data.email ?? existe.email,
                servicio: data.servicio ?? existe.servicio,
                fecha: data.fecha ? new Date(data.fecha) : existe.fecha,
                duracion: data.duracion ?? existe.duracion,
                estado: data.estado ?? existe.estado,
                notas: data.notas ?? existe.notas,
            },
        });
    },
    async remove(tenantId, id) {
        const existe = await prisma.cita.findFirst({ where: { id, tenantId } });
        if (!existe)
            throw new Error('no-encontrada');
        await prisma.cita.delete({ where: { id } });
        return true;
    },
    async findByEstado(tenantId, estado) {
        return prisma.cita.findMany({
            where: { tenantId, estado },
            orderBy: { fecha: 'asc' },
        });
    },
    async stats(tenantId) {
        const total = await prisma.cita.count({ where: { tenantId } });
        const porEstado = await prisma.cita.groupBy({
            by: ['estado'],
            where: { tenantId },
            _count: { estado: true },
        });
        return { total, porEstado };
    },
};
//# sourceMappingURL=agenda-prisma.js.map