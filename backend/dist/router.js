"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const agenda_prisma_1 = require("./services/agenda-prisma");
const nlp_1 = require("./core/nlp");
const confirmation_1 = require("./services/confirmation");
const tenants_1 = require("./services/tenants");
exports.router = (0, express_1.Router)();
async function tenantMiddleware(req, res, next) {
    try {
        const { slug } = req.params;
        const tenant = await tenants_1.TenantService.getBySlug(slug);
        if (!tenant) {
            return res.status(404).json({ ok: false, error: 'Tenant no encontrado' });
        }
        req.tenant = tenant;
        return next();
    }
    catch (err) {
        return res.status(500).json({ ok: false, error: 'Error al validar tenant' });
    }
}
exports.router.get('/:slug/citas', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const citas = await agenda_prisma_1.AgendaService.list(tenant.id);
        return res.json(citas);
    }
    catch (e) {
        return next(e);
    }
});
exports.router.get('/:slug/citas/:id', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const cita = await agenda_prisma_1.AgendaService.getById(tenant.id, req.params.id);
        if (!cita) {
            return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
        }
        return res.json({ ok: true, cita });
    }
    catch (e) {
        return next(e);
    }
});
exports.router.post('/:slug/citas', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const body = req.body;
        const cita = await agenda_prisma_1.AgendaService.create(tenant.id, body);
        const location = `/${tenant.slug}/citas/${cita.id}`;
        return res.status(201).location(location).json({ ok: true, citaId: cita.id, cita });
    }
    catch (e) {
        if (e.message === 'slot-ocupado') {
            return res.status(400).json({ ok: false, error: 'Ya existe una cita en ese horario.' });
        }
        return next(e);
    }
});
exports.router.put('/:slug/citas/:id', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const cita = await agenda_prisma_1.AgendaService.update(tenant.id, req.params.id, req.body);
        return res.json(cita);
    }
    catch (e) {
        if (e.message === 'no-encontrada') {
            return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
        }
        return next(e);
    }
});
exports.router.delete('/:slug/citas/:id', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        await agenda_prisma_1.AgendaService.remove(tenant.id, req.params.id);
        return res.json({ ok: true, message: `Cita ${req.params.id} eliminada` });
    }
    catch (e) {
        if (e.message === 'no-encontrada') {
            return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
        }
        return next(e);
    }
});
exports.router.get('/:slug/citas/resolve', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const { telefono, fecha } = req.query;
        if (!telefono || !fecha) {
            return res.status(400).json({ ok: false, error: 'Faltan parámetros: telefono y fecha' });
        }
        const cita = await agenda_prisma_1.AgendaService.resolveByTelefonoFecha(tenant.id, String(telefono), String(fecha));
        if (!cita) {
            return res.status(404).json({ ok: false, error: 'No encontrada' });
        }
        return res.json({ ok: true, citaId: cita.id, cita });
    }
    catch (e) {
        return next(e);
    }
});
exports.router.post('/:slug/dialog', tenantMiddleware, async (req, res, next) => {
    try {
        const tenant = req.tenant;
        const { texto = '', cliente = {} } = req.body || {};
        const { intent, slots } = await (0, nlp_1.detectIntentAndSlots)(texto);
        if (intent.name === 'reservar') {
            const fecha = slots['fecha'];
            const hora = slots['hora'];
            const fechaHora = new Date(`${fecha}T${hora}:00`);
            const cita = await agenda_prisma_1.AgendaService.create(tenant.id, {
                cliente: cliente.nombre,
                telefono: cliente.telefono,
                email: cliente.email,
                servicio: slots['servicio'],
                fecha: fechaHora.toISOString(),
                duracion: 30,
                estado: 'PENDIENTE',
                notas: '',
            });
            return res.json({
                reply: (0, confirmation_1.formatConfirmation)(cita),
                citaId: cita.id,
                confirmToken: Buffer.from(JSON.stringify(cita)).toString('base64'),
            });
        }
        return res.json({ reply: '¿Desea reservar, modificar, cancelar o pedir información?' });
    }
    catch (e) {
        return next(e);
    }
});
//# sourceMappingURL=router.js.map