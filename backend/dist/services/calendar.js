"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
const googleapis_1 = require("googleapis");
async function createEvent(cita) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = googleapis_1.google.calendar({ version: "v3", auth });
    const calendarId = cita.calendarId ?? process.env['GOOGLE_CALENDAR_ID'];
    if (!calendarId)
        throw new Error("Falta GOOGLE_CALENDAR_ID");
    const tz = cita.timezone ?? process.env['DEFAULT_TIMEZONE'] ?? "Europe/Madrid";
    const start = new Date(cita.fecha);
    const end = new Date(start.getTime() + (cita.duracion ?? 30) * 60000);
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
//# sourceMappingURL=calendar.js.map