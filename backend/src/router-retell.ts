import { Router, Request, Response } from 'express';
import { detectIntentAndSlots } from './core/nlp';
import { AgendaService } from './services/agenda-prisma';
import { TenantService } from './services/tenants';

export const retellRouter = Router();

/** Webhook Retell: crea cita y devuelve citaId para que Retell lo guarde */
retellRouter.post('/webhook/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { sessionId, text, cliente } = req.body || {};

    if (!slug) return res.json({ reply: '⚠️ Slug requerido.' });

    const tenant = await TenantService.getBySlug(slug);
    if (!tenant) return res.json({ reply: '⚠️ Negocio no encontrado.' });

    const { intent, slots } = await detectIntentAndSlots(text || '');

    if (intent.name === 'reservar') {
      const missing: string[] = [];
      if (!slots['servicio']) missing.push('el tipo de servicio');
      if (!slots['fecha']) missing.push('la fecha');
      if (!slots['hora']) missing.push('la hora');
      if (!cliente?.nombre) missing.push('su nombre');
      if (!cliente?.telefono) missing.push('su teléfono');

      if (missing.length) {
        return res.json({ reply: `Para confirmar la cita necesito ${missing.join(', ')}.` });
      }

      const fechaHora = new Date(`${slots['fecha']}T${slots['hora']}:00`);

      const cita = await AgendaService.create(tenant.id, {
        cliente: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        servicio: slots['servicio']!,
        fecha: fechaHora.toISOString(),
        duracion: 30,
        estado: 'PENDIENTE',
        notas: '',
      });

      return res.json({
        reply: `✅ Cita confirmada para ${slots['fecha']} a las ${slots['hora']}.`,
        citaId: cita.id,                  // 👈 Retell debe guardar esto
        cita,
        confirmToken: Buffer.from(JSON.stringify(cita)).toString('base64'),
        sessionId,                         // por si quieres asociarlo en BD en el futuro
      });
    }

    return res.json({ reply: '¿Quiere reservar, modificar o cancelar una cita?' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: '❌ Error procesando la solicitud.' });
  }
});
