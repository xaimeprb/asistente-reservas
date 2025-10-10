import express, { Request, Response } from "express";
import { z } from "zod";
import { DateTime } from "luxon";
import { detectIntentAndSlots } from "../core/nlp";
import { AgendaService } from "../services/agenda-prisma";
import { TenantService } from "../services/tenants";
import { createCalendarEvent } from "../services/calendarService";

export const retellRouter = express.Router();

// ✅ Validación del cuerpo con zod
const BodySchema = z.object({
  sessionId: z.string().optional(),
  text: z.string().min(1, "texto requerido"),
  cliente: z
    .object({
      nombre: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});

/**
 * 🔧 Función robusta para convertir fecha/hora en objeto Date.
 * Soporta: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY y hora flexible (10, 10:00, 930…)
 */
function parseFechaHora(fecha: string, hora: string, tz: string): Date {
  let fechaISO = fecha.trim();
  let horaISO = hora.trim();

  // Normalizar formato de fecha
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaISO)) {
    const [d, m, y] = fechaISO.split("/");
    fechaISO = `${y}-${m}-${d}`;
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(fechaISO)) {
    const [d, m, y] = fechaISO.split("-");
    fechaISO = `${y}-${m}-${d}`;
  }

  // Normalizar hora (acepta 9, 09:00, 930, etc.)
  const match = horaISO.match(/^(\d{1,2})([:.]?(\d{2}))?$/);
  if (match) {
    const h = match[1].padStart(2, "0");
    const m = match[3] ? match[3].padStart(2, "0") : "00";
    horaISO = `${h}:${m}`;
  }

  // Control especial para "24:00"
  if (horaISO === "24:00") {
    horaISO = "00:00";
    const d = DateTime.fromISO(fechaISO, { zone: tz }).plus({ days: 1 });
    fechaISO = d.toISODate()!;
  }

  // Intento de parseo con luxon
  const dt = DateTime.fromISO(`${fechaISO}T${horaISO}`, { zone: tz });

  if (!dt.isValid) {
    console.error("❌ Fecha/hora no válidas:", fechaISO, horaISO);
    throw new Error("invalid-fecha-hora");
  }

  console.log("🕐 Fecha parseada correctamente:", dt.toISO());
  return dt.toJSDate();
}

/** === Webhook Retell === */
retellRouter.post("/webhook/:slug", async (req: Request, res: Response) => {
  try {
    // 🔒 Validación del token
    const authHeader = req.headers.authorization;
    const expected = process.env["RETELL_API_SECRET"];
    if (expected && authHeader !== `Bearer ${expected}`) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }

    // 🧩 Validar el body
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      console.error("❌ Body inválido:", parsed.error.format());
      return res.status(400).json({ error: "Payload inválido" });
    }
    const { sessionId, text, cliente } = parsed.data;

    const { slug } = req.params;
    if (!slug) return res.status(400).json({ reply: "⚠️ Falta el slug." });

    const tenant = await TenantService.getBySlug(slug);
    if (!tenant)
      return res.status(404).json({ reply: "⚠️ Negocio no encontrado." });

    const { intent, slots } = await detectIntentAndSlots(text || "");

    // 🎯 Solo procesamos reservas
    if (intent.name !== "reservar") {
      return res.json({
        reply: "¿Quieres reservar, modificar o cancelar una cita?",
        sessionId,
      });
    }

    // ⚙️ Campos requeridos
    const faltan: string[] = [];
    if (!slots["fecha"]) faltan.push("la fecha");
    if (!slots["hora"]) faltan.push("la hora");
    if (!cliente?.nombre) faltan.push("su nombre");
    if (!cliente?.telefono) faltan.push("su teléfono");

    // 🧩 Si el cliente no menciona el servicio, usar el del negocio
    const defaultService = tenant?.defaultService ?? "Consulta general";
    if (!slots["servicio"]) slots["servicio"] = defaultService;
    
    if (faltan.length) {
      return res.json({
        reply: `Para confirmar la cita necesito ${faltan.join(", ")}.`,
        sessionId,
      });
    }

    // 🕐 Parseo de fecha/hora con control total
    const tz = process.env["DEFAULT_TIMEZONE"] ?? "Europe/Madrid";
    let fechaHora: Date;
    try {
      fechaHora = parseFechaHora(String(slots["fecha"]), String(slots["hora"]), tz);
    } catch {
      return res.status(400).json({ reply: "⚠️ Fecha u hora inválida.", sessionId });
    }

    // 🗓️ Crear cita en BD
    const cita = await AgendaService.create(tenant.id, {
      cliente: cliente!.nombre!,
      telefono: cliente!.telefono!,
      email: cliente?.email ?? null,
      servicio: slots["servicio"]!,
      fecha: fechaHora.toISOString(),
      duracion: 30,
      estado: "PENDIENTE",
      notas: "",
    });

    // 📅 Crear evento en Google Calendar
    try {
      await createCalendarEvent(cita);
      console.log(`📅 Evento añadido en Google Calendar para ${cita.cliente}`);
    } catch (err) {
      console.error("⚠️ No se pudo crear el evento en Calendar:", err);
    }

    // 💬 Respuesta amigable
    const fechaLocal = DateTime.fromJSDate(fechaHora).setZone(tz);
    const fechaOut = fechaLocal.toLocaleString(DateTime.DATE_FULL);
    const horaOut = fechaLocal.toFormat("HH:mm");

    return res.json({
      reply: `✅ Cita confirmada para ${fechaOut} a las ${horaOut} (${slots["servicio"]}).`,
      citaId: cita.id,
      cita,
      sessionId,
    });
  } catch (error) {
    console.error("💥 Error general en webhook Retell:", error);
    return res
      .status(500)
      .json({ reply: "❌ Error procesando la solicitud del webhook." });
  }
});
