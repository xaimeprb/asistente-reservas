"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retellRouter = void 0;
const express_1 = require("express");
const nlp_1 = require("./core/nlp");
const agenda_prisma_1 = require("./services/agenda-prisma");
const tenants_1 = require("./services/tenants");
exports.retellRouter = (0, express_1.Router)();
exports.retellRouter.post('/webhook/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { sessionId, text, cliente } = req.body || {};
        if (!slug) {
            return res.json({ reply: '⚠️ Slug requerido.' });
        }
        const tenant = await tenants_1.TenantService.getBySlug(slug);
        if (!tenant) {
            return res.json({ reply: '⚠️ Negocio no encontrado.' });
        }
        const { intent, slots } = await (0, nlp_1.detectIntentAndSlots)(text || '');
        if (intent.name === 'reservar') {
            const missing = [];
            if (!slots['servicio'])
                missing.push('el tipo de servicio');
            if (!slots['fecha'])
                missing.push('la fecha');
            if (!slots['hora'])
                missing.push('la hora');
            if (!cliente?.nombre)
                missing.push('su nombre');
            if (!cliente?.telefono)
                missing.push('su teléfono');
            if (missing.length) {
                return res.json({ reply: `Para confirmar la cita necesito ${missing.join(', ')}.` });
            }
            const fechaHora = new Date(`${slots['fecha']}T${slots['hora']}:00`);
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
                reply: `✅ Cita confirmada para ${slots['fecha']} a las ${slots['hora']}.`,
                citaId: cita.id,
                cita,
                confirmToken: Buffer.from(JSON.stringify(cita)).toString('base64'),
                sessionId,
            });
        }
        return res.json({ reply: '¿Quiere reservar, modificar o cancelar una cita?' });
    }
    catch (err) {
        console.error('❌ Error en webhook Retell:', err);
        return res.status(500).json({ reply: '❌ Error procesando la solicitud.' });
    }
});
//# sourceMappingURL=router-retell.js.map