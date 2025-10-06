"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const agenda_prisma_1 = require("./services/agenda-prisma");
const tenants_1 = require("./services/tenants");
const client_1 = require("@prisma/client");
const requireAuth_1 = require("./middlewares/requireAuth");
exports.adminRouter = (0, express_1.Router)();
async function tenantMiddleware(req, res, next) {
    const { slug } = req.params;
    const tenant = await tenants_1.TenantService.getBySlug(slug);
    if (!tenant) {
        return res.status(404).json({ ok: false, error: 'Tenant no encontrado' });
    }
    req.tenant = tenant;
    return next();
}
exports.adminRouter.post('/tenants', (0, requireAuth_1.requireAuth)(['SUPERADMIN']), async (req, res) => {
    try {
        const tenant = await tenants_1.TenantService.create(req.body);
        return res.status(201).json({ ok: true, tenant });
    }
    catch (err) {
        return res.status(400).json({ ok: false, error: err.message });
    }
});
exports.adminRouter.get('/tenants', (0, requireAuth_1.requireAuth)(['SUPERADMIN']), async (_req, res) => {
    const tenants = await tenants_1.TenantService.list();
    return res.json(tenants);
});
exports.adminRouter.get('/tenants/:slug', (0, requireAuth_1.requireAuth)(['SUPERADMIN']), async (req, res) => {
    const tenant = await tenants_1.TenantService.getBySlug(req.params['slug']);
    if (!tenant)
        return res.status(404).json({ ok: false, error: 'No existe' });
    return res.json(tenant);
});
exports.adminRouter.get('/:slug/citas', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    const citas = await agenda_prisma_1.AgendaService.list(tenant.id);
    return res.json(citas);
});
exports.adminRouter.get('/:slug/citas/estado/:estado', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    const estado = req.params.estado.toUpperCase();
    if (!Object.values(client_1.EstadoCita).includes(estado)) {
        return res.status(400).json({ ok: false, error: 'Estado no válido' });
    }
    const citas = await agenda_prisma_1.AgendaService.findByEstado(tenant.id, estado);
    return res.json(citas);
});
exports.adminRouter.post('/:slug/citas', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    const cita = await agenda_prisma_1.AgendaService.create(tenant.id, req.body);
    return res.status(201).json(cita);
});
exports.adminRouter.put('/:slug/citas/:id', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    try {
        const cita = await agenda_prisma_1.AgendaService.update(tenant.id, req.params.id, req.body);
        return res.json(cita);
    }
    catch (e) {
        if (e.message === 'no-encontrada') {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        throw e;
    }
});
exports.adminRouter.delete('/:slug/citas/:id', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    try {
        await agenda_prisma_1.AgendaService.remove(tenant.id, req.params.id);
        return res.json({ ok: true, message: `Cita ${req.params.id} eliminada` });
    }
    catch (e) {
        if (e.message === 'no-encontrada') {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        throw e;
    }
});
exports.adminRouter.get('/:slug/stats', (0, requireAuth_1.requireAuth)(['ADMIN', 'SUPERADMIN']), tenantMiddleware, async (req, res) => {
    const tenant = req.tenant;
    const stats = await agenda_prisma_1.AgendaService.stats(tenant.id);
    return res.json(stats);
});
//# sourceMappingURL=adminRouter.js.map