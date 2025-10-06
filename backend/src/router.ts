import { Router, Request, Response, NextFunction } from 'express';
import { AgendaService } from './services/agenda-prisma';
import { detectIntentAndSlots } from './core/nlp';
import { formatConfirmation } from './services/confirmation';
import { TenantService } from './services/tenants';
import { CitaInput } from './types/cita-input';

export const router = Router();

/** Middleware para validar tenant */
async function tenantMiddleware(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;
    const tenant = await TenantService.getBySlug(slug);
    if (!tenant) {
      return res.status(404).json({ ok: false, error: 'Tenant no encontrado' });
    }
    (req as any).tenant = tenant;
    return next();
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Error al validar tenant' });
  }
}

/** === CITAS MULTI-TENANT === */

// Listar todas
router.get('/:slug/citas', tenantMiddleware, async (req, res, next) => {
  try {
    const tenant = (req as any).tenant;
    const citas = await AgendaService.list(tenant.id);
    return res.json(citas);
  } catch (e) {
    return next(e);
  }
});

// Obtener por ID
router.get(
  '/:slug/citas/:id',
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      const cita = await AgendaService.getById(tenant.id, req.params.id);
      if (!cita) {
        return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
      }
      return res.json({ ok: true, cita });
    } catch (e) {
      return next(e);
    }
  }
);

// Crear nueva cita
router.post(
  '/:slug/citas',
  tenantMiddleware,
  async (req: Request<{ slug: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      const body = req.body as CitaInput;
      const cita = await AgendaService.create(tenant.id, body);
      const location = `/${tenant.slug}/citas/${cita.id}`;
      return res.status(201).location(location).json({ ok: true, citaId: cita.id, cita });
    } catch (e: any) {
      if (e.message === 'slot-ocupado') {
        return res.status(400).json({ ok: false, error: 'Ya existe una cita en ese horario.' });
      }
      return next(e);
    }
  }
);

// Actualizar cita existente
router.put(
  '/:slug/citas/:id',
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      const cita = await AgendaService.update(tenant.id, req.params.id, req.body);
      return res.json(cita);
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
      }
      return next(e);
    }
  }
);

// Eliminar cita
router.delete(
  '/:slug/citas/:id',
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      await AgendaService.remove(tenant.id, req.params.id);
      return res.json({ ok: true, message: `Cita ${req.params.id} eliminada` });
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
      }
      return next(e);
    }
  }
);

// Resolver cita por teléfono + fecha
router.get(
  '/:slug/citas/resolve',
  tenantMiddleware,
  async (req: Request<{ slug: string }, any, any, { telefono?: string; fecha?: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      const { telefono, fecha } = req.query;
      if (!telefono || !fecha) {
        return res.status(400).json({ ok: false, error: 'Faltan parámetros: telefono y fecha' });
      }
      const cita = await AgendaService.resolveByTelefonoFecha(tenant.id, String(telefono), String(fecha));
      if (!cita) {
        return res.status(404).json({ ok: false, error: 'No encontrada' });
      }
      return res.json({ ok: true, citaId: cita.id, cita });
    } catch (e) {
      return next(e);
    }
  }
);

/** === DIALOG === */
router.post(
  '/:slug/dialog',
  tenantMiddleware,
  async (req: Request<{ slug: string }>, res: Response, next: NextFunction) => {
    try {
      const tenant = (req as any).tenant;
      const { texto = '', cliente = {} } = req.body || {};
      const { intent, slots } = await detectIntentAndSlots(texto);

      if (intent.name === 'reservar') {
        const fecha = slots['fecha']!;
        const hora = slots['hora']!;
        const fechaHora = new Date(`${fecha}T${hora}:00`);

        const cita = await AgendaService.create(tenant.id, {
          cliente: (cliente as any).nombre,
          telefono: (cliente as any).telefono,
          email: (cliente as any).email,
          servicio: slots['servicio']!,
          fecha: fechaHora.toISOString(),
          duracion: 30,
          estado: 'PENDIENTE',
          notas: '',
        });

        return res.json({
          reply: formatConfirmation(cita as any),
          citaId: cita.id,
          confirmToken: Buffer.from(JSON.stringify(cita)).toString('base64'),
        });
      }

      return res.json({ reply: '¿Desea reservar, modificar, cancelar o pedir información?' });
    } catch (e) {
      return next(e);
    }
  }
);
