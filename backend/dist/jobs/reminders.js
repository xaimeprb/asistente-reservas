"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReminders = initReminders;
const node_cron_1 = __importDefault(require("node-cron"));
const agenda_prisma_1 = require("../services/agenda-prisma");
const twilio_1 = __importDefault(require("twilio"));
function initReminders() {
    const client = (0, twilio_1.default)(process.env['TWILIO_ACCOUNT_SID'], process.env['TWILIO_AUTH_TOKEN']);
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        const now = new Date();
        const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const citas = await agenda_prisma_1.AgendaService.list("");
        for (const cita of citas) {
            await client.messages.create({
                from: process.env['TWILIO_WHATSAPP_FROM'],
                to: `whatsapp:${cita.telefono}`,
                body: `⏰ Recordatorio: tienes tu cita de ${cita.servicio} a las ${cita.fecha}`,
            });
        }
    });
}
//# sourceMappingURL=reminders.js.map