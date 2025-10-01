// src/router-retell.ts
import { Router, Request, Response } from "express";
import { detectIntentAndSlots } from "./core/nlp";
import { AgendaService } from "./services/agenda-prisma";
import { BusinessRules } from "./core/rules";
import { TenantService } from "./services/tenants";

export const retellRouter = Router();

/**
 * Webhook que recibe eventos de Retell AI
 */
retellRouter.post("/webhook/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { sessionId, text, cliente } = req.body;

    if (!slug) {
      return res.json({ reply: "⚠️ Slug de negocio requerido." });
    }

    // buscar tenant
    const tenant = await TenantService.getBySlug(slug);
    if (!tenant) {
      return res.json({ reply: "⚠️ Negocio no encontrado." });
    }

    // detectar intención
    const { intent, slots } = await detectIntentAndSlots(text);

    if (intent.name === "reservar") {
      const missing: string[] = [];
      if (!slots["servicio"]) missing.push("el tipo de servicio");
      if (!slots["fecha"]) missing.push("la fecha");
      if (!slots["hora"]) missing.push("la hora");
      if (!cliente?.nombre) missing.push("su nombre");
      if (!cliente?.telefono) missing.push("su teléfono");

      if (missing.length) {
        return res.json({
          reply: `Para confirmar la cita necesito ${missing.join(", ")}.`,
        });
      }

      const fechaHora = new Date(`${slots["fecha"]}T${slots["hora"]}:00`);
      if (!BusinessRules.esHorarioLaboral(fechaHora)) {
        return res.json({
          reply: "📅 Nuestro horario es de lunes a viernes de 10:00 a 20:00.",
        });
      }

      const cita = await AgendaService.create(tenant.id, {
        cliente: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        servicio: slots["servicio"]!,
        fecha: fechaHora.toISOString(),
        duracion: 30,
        estado: "PENDIENTE",
        notas: "",
      });

      return res.json({
        reply: `✅ Cita confirmada para ${slots["fecha"]} a las ${slots["hora"]}.`,
        confirmToken: Buffer.from(JSON.stringify(cita)).toString("base64"),
      });
    }

    if (intent.name === "informacion") {
      return res.json({ reply: "Estamos en Calle Mayor 1. Horario: 10:00 a 20:00." });
    }

    return res.json({ reply: "¿Quiere reservar, modificar o cancelar una cita?" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "❌ Error procesando la solicitud." });
  }
});
