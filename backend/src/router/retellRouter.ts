import express, { Request, Response } from "express";
import { detectIntentAndSlots } from "../core/nlp";
import { AgendaService } from "../services/agenda-prisma";
import { TenantService } from "../services/tenants";
import { createCalendarEvent } from "../services/calendarService";
import { DateTime } from "luxon";

export const retellRouter = express.Router();

/** Webhook Retell multi-tenant: /api/retell/webhook/:slug */
retellRouter.post("/webhook/:slug", async (req: Request, res: Response) => {
  try {
    // 🔒 Verificación del token secreto
    const authHeader = req.headers.authorization;
    if (
      process.env["RETELL_API_SECRET"] &&
      authHeader !== `Bearer ${process.env["RETELL_API_SECRET"]}`
    ) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }

    const { slug } = req.params;
    const { sessionId, text, cliente } = req.body || {};

    if (!slug) return res.json({ reply: "⚠️ Falta el slug del negocio." });

    const tenant = await TenantService.getBySlug(slug);
    if (!tenant)
      return res.json({ reply: "⚠️ No se encontró el negocio indicado." });

    const { intent, slots } = await detectIntentAndSlots(text || "");

    if (intent.name === "reservar") {
      const faltan: string[] = [];
      if (!slots["servicio"]) faltan.push("el tipo de servicio");
      if (!slots["fecha"]) faltan.push("la fecha");
      if (!slots["hora"]) faltan.push("la hora");
      if (!cliente?.nombre) faltan.push("su nombre");
      if (!cliente?.telefono) faltan.push("su teléfono");

      if (faltan.length) {
        return res.json({
          reply: `Para confirmar la cita necesito ${faltan.join(", ")}.`,
        });
      }

      // 🕐 Ajuste horario Europe/Madrid con validación
      const tz = process.env["DEFAULT_TIMEZONE"] ?? "Europe/Madrid";

      // Normalizar hora — si el modelo devuelve 24:00, pasamos al día siguiente
      let horaFormateada = slots["hora"];
      if (horaFormateada === "24:00" || horaFormateada === "24") {
        horaFormateada = "00:00";
        slots["fecha"] = DateTime.fromISO(slots["fecha"])
          .plus({ days: 1 })
          .toISODate();
      }

      // Crear objeto fecha con timezone correcto
      const fechaHora = DateTime.fromISO(`${slots["fecha"]}T${horaFormateada}`)
        .setZone(tz)
        .toJSDate();

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

      // ✅ Crear evento en Google Calendar
      try {
        await createCalendarEvent(cita);
        console.log(`📅 Evento añadido en Google Calendar para ${cita.cliente}`);
      } catch (err) {
        console.error("❌ Error al crear evento en Calendar:", err);
      }

      return res.json({
        reply: `✅ Cita confirmada para ${slots["fecha"]} a las ${horaFormateada}.`,
        citaId: cita.id,
        cita,
        confirmToken: Buffer.from(JSON.stringify(cita)).toString("base64"),
        sessionId,
      });
    }

    return res.json({
      reply: "¿Quieres reservar, modificar o cancelar una cita?",
    });
  } catch (error) {
    console.error("❌ Error en webhook Retell:", error);
    return res
      .status(500)
      .json({ reply: "❌ Error procesando la solicitud del webhook." });
  }
});
