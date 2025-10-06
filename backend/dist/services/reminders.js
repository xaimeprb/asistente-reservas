"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const agenda_prisma_1 = require("./agenda-prisma");
const whatsapp_1 = require("./whatsapp");
node_cron_1.default.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const citas = await agenda_prisma_1.AgendaService.list("");
    for (const cita of citas) {
        await (0, whatsapp_1.sendWhatsAppConfirm)(cita.telefono, {
            ...cita,
            servicio: `⏰ Recordatorio: ${cita.servicio}`,
        });
    }
});
//# sourceMappingURL=reminders.js.map