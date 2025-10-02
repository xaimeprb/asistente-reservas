import { Router, Request, Response, NextFunction } from 'express';
import { AgendaService } from './services/agenda-prisma';
import { TenantService } from './services/tenants';
import { EstadoCita } from '@prisma/client';
import { requireAuth } from './middlewares/requireAuth';

export const adminRouter = Router();

/**
 * Middleware para validar tenant
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
  (req as any).tenant = tenant;
  return next(); // ✅ return añadido
}

// ======================== CRUD CITAS ========================

// 📌 Listar todas las citas de un tenant
adminRouter.get(
  '/:slug/citas',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const citas = await AgendaService.list(tenant.id);
    return res.json(citas); // ✅ return añadido
  }
);

// 📌 Filtrar citas por estado
adminRouter.get(
  '/:slug/citas/estado/:estado',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req: Request<{ slug: string; estado: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    const estado = req.params.estado.toUpperCase() as EstadoCita;

    if (!Object.values(EstadoCita).includes(estado)) {
      return res.status(400).json({ ok: false, error: 'Estado no válido' });
    }

    const citas = await AgendaService.findByEstado(tenant.id, estado);
    return res.json(citas); // ✅ return añadido
  }
);

// 📌 Crear cita manualmente (admin)
adminRouter.post(
  '/:slug/citas',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const cita = await AgendaService.create(tenant.id, req.body);
    return res.status(201).json(cita); // ✅ return añadido
  }
);

// 📌 Actualizar una cita
adminRouter.put(
  '/:slug/citas/:id',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    try {
      const cita = await AgendaService.update(tenant.id, req.params.id, req.body);
      return res.json(cita); // ✅ return añadido
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      throw e;
    }
  }
);

// 📌 Eliminar una cita
adminRouter.delete(
  '/:slug/citas/:id',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    try {
      await AgendaService.remove(tenant.id, req.params.id);
      return res.json({ ok: true, message: `Cita ${req.params.id} eliminada` }); // ✅ return añadido
    } catch (e: any) {
      if (e.message === 'no-encontrada') {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      throw e;
    }
  }
);

// 📌 Estadísticas básicas del tenant
adminRouter.get(
  '/:slug/stats',
  requireAuth(['ADMIN', 'SUPERADMIN']),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const stats = await AgendaService.stats(tenant.id);
    return res.json(stats); // ✅ return añadido
  }
);
