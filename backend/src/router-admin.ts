import { Router, Request, Response, NextFunction } from "express";
import { AgendaService } from "./services/agenda-prisma";
import { TenantService } from "./services/tenants";
import { EstadoCita, PrismaClient } from "@prisma/client";
import { requireAuth } from "./middlewares/requireAuth";

const prisma = new PrismaClient();
export const adminRouter = Router();

/**
 * Middleware para validar tenant por slug
 */
async function tenantMiddleware(
  req: Request<{ slug: string }>,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const tenant = await TenantService.getBySlug(slug);
  if (!tenant) {
    return res.status(404).json({ ok: false, error: "Tenant no encontrado" });
  }
  (req as any).tenant = tenant;
  return next();
}

// ======================== CRUD TENANTS ========================

// 📌 Listar todos los tenants
adminRouter.get(
  "/tenants",
  requireAuth(["SUPERADMIN"]),
  async (_req, res) => {
    const tenants = await prisma.tenant.findMany();
    return res.json(tenants);
  }
);

// Crear un tenant (solo SUPERADMIN)
adminRouter.post(
  '/tenants',
  requireAuth(['SUPERADMIN']),
  async (req, res) => {
    try {
      const { nombre, direccion, telefono, email } = req.body;
      const tenant = await TenantService.create({ nombre, direccion, telefono, email });
      return res.status(201).json({ ok: true, tenant });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
);


// 📌 Obtener un tenant por id
adminRouter.get(
  "/tenants/:id",
  requireAuth(["SUPERADMIN"]),
  async (req, res) => {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params['id'] },
    });
    if (!tenant) return res.status(404).json({ error: "Tenant no encontrado" });
    return res.json(tenant);
  }
);

// 📌 Actualizar un tenant
adminRouter.put(
  "/tenants/:id",
  requireAuth(["SUPERADMIN"]),
  async (req, res) => {
    const tenant = await prisma.tenant.update({
      where: { id: req.params['id'] },
      data: req.body,
    });
    return res.json(tenant);
  }
);

// 📌 Eliminar un tenant
adminRouter.delete(
  "/tenants/:id",
  requireAuth(["SUPERADMIN"]),
  async (req, res) => {
    await prisma.tenant.delete({ where: { id: req.params['id'] } });
    return res.json({ ok: true, message: "Tenant eliminado" });
  }
);

// ======================== CRUD CITAS (YA TENÍAS ESTO) ========================
adminRouter.get(
  "/:slug/citas",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const citas = await AgendaService.list(tenant.id);
    return res.json(citas);
  }
);

adminRouter.get(
  "/:slug/citas/estado/:estado",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req: Request<{ slug: string; estado: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    const estado = req.params.estado.toUpperCase() as EstadoCita;

    if (!Object.values(EstadoCita).includes(estado)) {
      return res.status(400).json({ ok: false, error: "Estado no válido" });
    }

    const citas = await AgendaService.findByEstado(tenant.id, estado);
    return res.json(citas);
  }
);

adminRouter.post(
  "/:slug/citas",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const cita = await AgendaService.create(tenant.id, req.body);
    return res.status(201).json(cita);
  }
);

adminRouter.put(
  "/:slug/citas/:id",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    try {
      const cita = await AgendaService.update(
        tenant.id,
        req.params['id'],
        req.body
      );
      return res.json(cita);
    } catch (e: any) {
      if (e.message === "no-encontrada") {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      throw e;
    }
  }
);

adminRouter.delete(
  "/:slug/citas/:id",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req: Request<{ slug: string; id: string }>, res: Response) => {
    const tenant = (req as any).tenant;
    try {
      await AgendaService.remove(tenant.id, req.params['id']);
      return res.json({ ok: true, message: `Cita ${req.params['id']} eliminada` });
    } catch (e: any) {
      if (e.message === "no-encontrada") {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      throw e;
    }
  }
);

adminRouter.get(
  "/:slug/stats",
  requireAuth(["ADMIN", "SUPERADMIN"]),
  tenantMiddleware,
  async (req, res) => {
    const tenant = (req as any).tenant;
    const stats = await AgendaService.stats(tenant.id);
    return res.json(stats);
  }
);
