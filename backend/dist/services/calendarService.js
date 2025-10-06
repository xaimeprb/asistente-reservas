"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCalendarEvent = createCalendarEvent;
const googleapis_1 = require("googleapis");
const luxon_1 = require("luxon");
function requireEnv(key) {
    const v = process.env[key];
    if (!v)
        throw new Error(`❌ Falta variable de entorno: ${key}`);
    return v;
}
async function createCalendarEvent(cita) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = googleapis_1.google.calendar({ version: "v3", auth });
    const calendarId = requireEnv("GOOGLE_CALENDAR_ID");
    const tz = process.env['DEFAULT_TIMEZONE'] ?? "Europe/Madrid";
    const start = luxon_1.DateTime.fromJSDate(new Date(cita.fecha)).setZone(tz);
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
//# sourceMappingURL=calendarService.js.map