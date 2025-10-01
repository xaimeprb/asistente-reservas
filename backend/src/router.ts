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
  next();
}

// =================== RUTAS DE CITAS MULTI-TENANT =================== //

// Listado de citas por tenant
router.get('/:slug/citas', tenantMiddleware, async (req, res, next) => {
  try {
    const tenant = (req as any).tenant;
    const citas = await AgendaService.list(tenant.id);
    res.json(citas);
  } catch (e) {
    next(e);
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
      res.status(201).json(cita);
    } catch (e: any) {
      if (e.message === 'slot-ocupado') {
        return res
          .status(400)
          .json({ ok: false, error: 'Ya existe una cita en ese horario.' });
      }
      next(e);
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
          cliente: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email,
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
      next(e);
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
      res.json(citaActualizada);
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({
          ok: false,
          error: 'No se pudo actualizar: la cita no existe.',
        });
      }
      next(e);
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
      res.json({ ok: true, message: `Cita ${id} eliminada correctamente` });
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({
          ok: false,
          error: 'No se pudo eliminar: la cita no existe.',
        });
      }
      next(e);
    }
  }
);
