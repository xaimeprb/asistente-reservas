import { google } from "googleapis";

export async function createEvent(cita: any) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env['GOOGLE_CREDENTIALS']!),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: `${cita.servicio} - ${cita.cliente}`,
    description: `Teléfono: ${cita.telefono}`,
    start: { dateTime: cita.fecha },
    end: { dateTime: new Date(new Date(cita.fecha).getTime() + cita.duracion * 60000).toISOString() },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 120 }],
    },
  };

  await calendar.events.insert({
    calendarId: process.env['GOOGLE_CALENDAR_ID']!,
    requestBody: event,
  });
}
