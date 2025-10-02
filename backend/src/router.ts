import { Router, Request, Response, NextFunction } from 'express';
import { AgendaService } from './services/agenda-prisma';
import { detectIntentAndSlots } from './core/nlp';
import { BusinessRules } from './core/rules';
import { formatConfirmation } from './services/confirmation';
import { getFAQs } from './services/faqs';
import { sendSms, sendEmail } from './adapters/notify';
import { TenantService } from './services/tenants';
import { CitaInput } from './types/cita-input';

export const router = Router();

/**
 * Middleware para validar tenant a partir del slug
 */
async function tenantMiddleware(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const tenant = await TenantService.getBySlug(slug);
  if (!tenant) {
    return res.status(404).json({ ok: false, error: 'Tenant no encontrado' });
  }
  (req as any).tenant = tenant; // guardamos el tenant completo
  return next(); // ✅ return añadido
}

// =================== RUTAS DE CITAS MULTI-TENANT =================== //

// Listado de citas por tenant
router.get('/:slug/citas', tenantMiddleware, async (req, res, next) => {
  try {
    const tenant = (req as any).tenant;
    const citas = await AgendaService.list(tenant.id);
    return res.json(citas); // ✅ return añadido
  } catch (e) {
    return next(e);
  }
});

// Crear cita directamente
router.post(
  '/:slug/citas',
  tenantMiddleware,
  async (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenant = (req as any).tenant;
      const body = req.body as CitaInput;
      const cita = await AgendaService.create(tenant.id, body);
      return res.status(201).json(cita); // ✅ return añadido
    } catch (e: any) {
      if (e.message === 'slot-ocupado') {
        return res
          .status(400)
          .json({ ok: false, error: 'Ya existe una cita en ese horario.' });
      }
      return next(e);
    }
  }
);

// Webhook reservar
router.post(
  '/:slug/dialog',
  tenantMiddleware,
  async (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenant = (req as any).tenant;
      const { texto = '', cliente = {} } = req.body || {};
      const { intent, slots } = await detectIntentAndSlots(texto);

      if (intent.name === 'reservar') {
        const fecha = slots['fecha']!;
        const hora = slots['hora']!;
        const fechaHora = new Date(`${fecha}T${hora}:00`);

        const citaInput: CitaInput = {
          cliente: (cliente as any).nombre,
          telefono: (cliente as any).telefono,
          email: (cliente as any).email,
          servicio: slots['servicio']!,
          fecha: fechaHora.toISOString(),
          duracion: 30,
          estado: 'PENDIENTE',
          notas: '',
        };

        const cita = await AgendaService.create(tenant.id, citaInput);

        return res.json({
          reply: formatConfirmation(cita as any),
          confirmToken: Buffer.from(JSON.stringify(cita)).toString('base64'),
        });
      }

      return res.json({
        reply: '¿Desea reservar, modificar, cancelar o pedir información?',
      });
    } catch (e) {
      return next(e);
    }
  }
);

// Actualizar una cita
router.put(
  '/:slug/citas/:id',
  tenantMiddleware,
  async (
    req: Request<{ slug: string; id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenant = (req as any).tenant;
      const { id } = req.params;
      const body = req.body as CitaInput;
      const citaActualizada = await AgendaService.update(tenant.id, id, body);
      return res.json(citaActualizada); // ✅ return añadido
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({
          ok: false,
          error: 'No se pudo actualizar: la cita no existe.',
        });
      }
      return next(e);
    }
  }
);

// Eliminar una cita
router.delete(
  '/:slug/citas/:id',
  tenantMiddleware,
  async (
    req: Request<{ slug: string; id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenant = (req as any).tenant;
      const { id } = req.params;
      await AgendaService.remove(tenant.id, id);
      return res.json({ ok: true, message: `Cita ${id} eliminada correctamente` });
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({
          ok: false,
          error: 'No se pudo eliminar: la cita no existe.',
        });
      }
      return next(e);
    }
  }
);
