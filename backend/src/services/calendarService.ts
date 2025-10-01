// Servicio para Google Calendar API con ADC
import { google } from "googleapis";
import { Cita } from "../generated/prisma";
import { DateTime } from "luxon";

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`❌ Falta variable de entorno: ${key}`);
  return v;
}

/**
 * Inserta un evento basado en tu entidad Cita (Prisma)
 * Requiere:
 *  - GOOGLE_CALENDAR_ID
 *  - (Opcional) DEFAULT_TIMEZONE (por defecto Europe/Madrid)
 *  - Service Account adjunta al servicio (ADC) con permiso "Hacer cambios en eventos"
 */
export async function createCalendarEvent(cita: Cita) {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  const calendarId = requireEnv("GOOGLE_CALENDAR_ID");
  const tz = process.env['DEFAULT_TIMEZONE'] ?? "Europe/Madrid";

  const start = DateTime.fromJSDate(new Date(cita.fecha)).setZone(tz);
  const end = start.plus({ minutes: cita.duracion ?? 30 });

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${cita.servicio} - ${cita.cliente}`,
      description: cita.telefono ? `Teléfono: ${cita.telefono}` : null,
      start: { dateTime: start.toISO(), timeZone: tz },
      end: { dateTime: end.toISO(), timeZone: tz },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 120 }],
      },
    },
  });

  console.log(`📅 Evento creado en Google Calendar para ${cita.cliente}`);
}
