import { google } from "googleapis";

/**
 * Crea un evento rápido en Google Calendar (uso genérico).
 * Requiere:
 *  - GOOGLE_CALENDAR_ID
 *  - (Opcional) DEFAULT_TIMEZONE (por defecto Europe/Madrid)
 *  - Service Account adjunta al servicio de Cloud Run con permiso "Hacer cambios en eventos"
 */
export async function createEvent(cita: {
  servicio: string;
  cliente: string;
  telefono?: string;
  fecha: string;       // ISO
  duracion?: number;   // minutos, default 30
  timezone?: string;   // ej "Europe/Madrid"
  calendarId?: string; // override
}) {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = cita.calendarId ?? process.env['GOOGLE_CALENDAR_ID'];
  if (!calendarId) throw new Error("Falta GOOGLE_CALENDAR_ID");

  const tz = cita.timezone ?? process.env['DEFAULT_TIMEZONE'] ?? "Europe/Madrid";
  const start = new Date(cita.fecha);
  const end = new Date(start.getTime() + (cita.duracion ?? 30) * 60_000);

  const event = {
    summary: `${cita.servicio} - ${cita.cliente}`,
    description: cita.telefono ? `Teléfono: ${cita.telefono}` : null,
    start: { dateTime: start.toISOString(), timeZone: tz },
    end: { dateTime: end.toISOString(), timeZone: tz },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 120 }],
    },
  };

  await calendar.events.insert({
    calendarId,
    requestBody: event,
  });
}
