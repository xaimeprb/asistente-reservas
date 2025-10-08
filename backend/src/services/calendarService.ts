import { google } from "googleapis";
import { Cita } from "@prisma/client";
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
 *  - GOOGLE_CREDENTIALS (cuenta de servicio)
 *  - DEFAULT_TIMEZONE (por defecto Europe/Madrid)
 */
export async function createCalendarEvent(cita: Cita) {
  const creds = process.env["GOOGLE_CREDENTIALS"];
  if (!creds) throw new Error("❌ Falta GOOGLE_CREDENTIALS en el entorno.");

  const credentials = JSON.parse(creds);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = requireEnv("GOOGLE_CALENDAR_ID");
  const tz = process.env["DEFAULT_TIMEZONE"] ?? "Europe/Madrid";

  // 🕐 Convertir a hora local (evita el desfase UTC)
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

  console.log(`📅 Evento añadido en Google Calendar para ${cita.cliente}`);
}
