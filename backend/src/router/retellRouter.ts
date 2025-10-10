import express, { Request, Response } from "express";
import { z } from "zod";
import { DateTime } from "luxon";
import { detectIntentAndSlots } from "../core/nlp";
import { AgendaService } from "../services/agenda-prisma";
import { TenantService } from "../services/tenants";
import { createCalendarEvent } from "../services/calendarService";

export const retellRouter = express.Router();

// ✅ Validación del cuerpo
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
 * Normaliza acentos y pasa a minúsculas para hacer matching robusto.
 */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // elimina diacríticos
}

/**
 * Convierte fecha/hora “explícitas” a Date (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY; 10, 10:00, 930, etc.)
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

  // Normalizar hora (acepta 9, 09:00, 930, 9.30…)
  const match = horaISO.match(/^(\d{1,2})(?:[:h\.]?(\d{2}))?$/);
  if (match) {
    const h = match[1].padStart(2, "0");
    const m = match[2] ? match[2].padStart(2, "0") : "00";
    horaISO = `${h}:${m}`;
  }

  // Control especial para "24:00"
  if (horaISO === "24:00") {
    horaISO = "00:00";
    const d = DateTime.fromISO(fechaISO, { zone: tz }).plus({ days: 1 });
    fechaISO = d.toISODate()!;
  }

  const dt = DateTime.fromISO(`${fechaISO}T${horaISO}`, { zone: tz });
  if (!dt.isValid) {
    throw new Error("invalid-fecha-hora");
  }
  return dt.toJSDate();
}

/**
 * 🧠 Fallback: intenta extraer fecha/hora relativas del texto en español.
 * Soporta: hoy, mañana, pasado mañana, este/proximo/siguiente + día semana,
 * y horas tipo “a las 4”, “4:30”, “4 de la tarde”, “mediodia”, “medianoche”, “am/pm”.
 */
function deriveFechaHoraDesdeTexto(textoOriginal: string, tz: string): { fecha?: string; hora?: string } {
  const text = norm(textoOriginal);
  const now = DateTime.now().setZone(tz);

  // --- FECHA ---
  let fechaDT: DateTime | undefined;

  // 1) Palabras clave simples
  if (/\bhoy\b/.test(text)) {
    fechaDT = now;
  } else if (/\bmanana\b/.test(text)) {
    fechaDT = now.plus({ days: 1 });
  } else if (/\bpasado\s+manana\b/.test(text)) {
    fechaDT = now.plus({ days: 2 });
  }

  // 2) Este/próximo/siguiente + día de la semana
  if (!fechaDT) {
    const weekdays: Record<string, number> = {
      lunes: 1,
      martess: 2, // fallback typo
      martes: 2,
      miercoles: 3,
      miércoles: 3, // por si acaso
      jueves: 4,
      viernes: 5,
      sabado: 6,
      sábado: 6,
      domingo: 7,
    };

    const m = text.match(/\b(este|proximo|siguiente)?\s*(lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)\b/);
    if (m) {
      const when = m[1]; // este | proximo | siguiente | undefined
      const day = m[2];
      const targetWeekday = weekdays[day] ?? undefined;
      if (targetWeekday) {
        let delta = (targetWeekday - now.weekday + 7) % 7; // próximo día igual o mismo día
        if (when === "proximo" || when === "siguiente") {
          // la semana siguiente (si delta=0, suma 7)
          delta = delta === 0 ? 7 : delta + 7;
        } else if (when === "este") {
          // dentro de esta semana (si hoy ya pasó, delta>0; si es hoy, delta=0)
          // si “este” y ya pasó esta semana, avanza a la siguiente
          if (delta === 0 && text.includes("a las")) {
            // si es “este lunes a las ...” y ya pasó la hora lo maneja la hora más abajo
          }
        }
        fechaDT = now.plus({ days: delta }).startOf("day");
      }
    }
  }

  // 3) Fecha explícita dd/mm/yyyy o dd-mm-yyyy o yyyy-mm-dd dentro del texto
  if (!fechaDT) {
    const m1 = text.match(/\b(\d{2})[\/-](\d{2})[\/-](\d{4})\b/);
    const m2 = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (m1) {
      const [_, d, m, y] = m1;
      fechaDT = DateTime.fromISO(`${y}-${m}-${d}`, { zone: tz });
    } else if (m2) {
      const [_, y, m, d] = m2;
      fechaDT = DateTime.fromISO(`${y}-${m}-${d}`, { zone: tz });
    }
  }

  // --- HORA ---
  let horaStr: string | undefined;

  // palabras especiales
  if (/\bmediodia\b/.test(text)) {
    horaStr = "12:00";
  } else if (/\bmedianoche\b/.test(text)) {
    horaStr = "00:00";
  } else {
    // "a las 4", "a las 4:30", "4pm", "4 de la tarde", etc.
    // capturamos hora y minutos
    const hm = text.match(/\b(?:a\s+las\s+)?(\d{1,2})(?::|h|\.| y )?(\d{2})?\b/);
    if (hm) {
      let h = parseInt(hm[1], 10);
      const m = hm[2] ? parseInt(hm[2], 10) : 0;

      // AM/PM o “de la tarde/noche/mañana/madrugada”
      const hasPM = /\b(pm|tarde|noche)\b/.test(text);
      const hasAM = /\b(am|manana|madrugada)\b/.test(text);

      if (hasPM && h < 12) h += 12;
      if (hasAM && h === 12) h = 0; // 12am -> 00

      // si pone “a las 4 de la tarde” sin minutos
      horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }

  const out: { fecha?: string; hora?: string } = {};
  if (fechaDT && fechaDT.isValid) out.fecha = fechaDT.toISODate();
  if (horaStr) out.hora = horaStr;

  return out;
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
    if (!tenant) return res.status(404).json({ reply: "⚠️ Negocio no encontrado." });

    const tz = process.env["DEFAULT_TIMEZONE"] ?? "Europe/Madrid";

    // 🧠 NLP principal
    const { intent, slots } = await detectIntentAndSlots(text || "");

    // 🎯 Solo procesamos reservas
    if (intent.name !== "reservar") {
      return res.json({
        reply: "¿Quieres reservar, modificar o cancelar una cita?",
        sessionId,
      });
    }

    // 🧩 Fallback para fecha/hora si no vinieron del NLP
    if (!slots["fecha"] || !slots["hora"]) {
      const fallback = deriveFechaHoraDesdeTexto(text, tz);
      if (!slots["fecha"] && fallback.fecha) slots["fecha"] = fallback.fecha;
      if (!slots["hora"] && fallback.hora) slots["hora"] = fallback.hora;
    }

    // 🧩 Servicio por defecto del tenant si el cliente no lo dijo
    const defaultService = (tenant as any).defaultService ?? "Consulta general";
    if (!slots["servicio"]) slots["servicio"] = defaultService;

    // ⚙️ Campos requeridos
    const faltan: string[] = [];
    if (!slots["fecha"]) faltan.push("la fecha");
    if (!slots["hora"]) faltan.push("la hora");
    if (!cliente?.nombre) faltan.push("su nombre");
    if (!cliente?.telefono) faltan.push("su teléfono");

    if (faltan.length) {
      return res.json({
        reply: `Para confirmar la cita necesito ${faltan.join(", ")}.`,
        sessionId,
      });
    }

    // 🕐 Parseo definitivo y seguro
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
