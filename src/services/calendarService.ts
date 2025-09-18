// Servicio para Google Calendar API
import { google } from "googleapis";
import { Cita } from "../generated/prisma";
import { DateTime } from "luxon";

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (typeof value === "undefined" || value === null || value === "") {
    throw new Error(`❌ Falta variable de entorno: ${key}`);
  }
  return value;
}

export async function createCalendarEvent(cita: Cita) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(getEnvVar("GOOGLE_CREDENTIALS")),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });

    const tz = getEnvVar("DEFAULT_TIMEZONE");
    const start = DateTime.fromJSDate(new Date(cita.fecha), { zone: tz });
    const end = start.plus({ minutes: cita.duracion });

    await calendar.events.insert({
      calendarId: getEnvVar("GOOGLE_CALENDAR_ID"),
      requestBody: {
        summary: `${cita.servicio} - ${cita.cliente}`,
        description: `Teléfono: ${cita.telefono}, Notas: ${cita.notas || ""}`,
        start: { dateTime: start.toISO(), timeZone: tz },
        end: { dateTime: end.toISO(), timeZone: tz },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 120 }], // 2h antes
        },
      },
    });

    console.log(`📅 Evento creado en Google Calendar para ${cita.cliente}`);
  } catch (err) {
    console.error("❌ Error creando evento en Google Calendar:", err);
  }
}
