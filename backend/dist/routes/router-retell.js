"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retellRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const agenda_prisma_1 = require("./services/agenda-prisma");
const notifyService_1 = require("./services/notifyService");
const calendarService_1 = require("./services/calendarService");
exports.retellRouter = express_1.default.Router();
const webhookSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    text: zod_1.z.string(),
    cliente: zod_1.z
        .object({
        nombre: zod_1.z.string().optional(),
        telefono: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    })
        .optional(),
});
exports.retellRouter.post("/webhook", async (req, res) => {
    try {
        const parsed = webhookSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Payload inválido" });
        }
        const { sessionId, text, cliente } = parsed.data;
        const authHeader = req.headers.authorization;
        if (process.env['RETELL_API_SECRET'] && authHeader !== `Bearer ${process.env['RETELL_API_SECRET']}`) {
            return res.status(403).json({ error: "Acceso no autorizado" });
        }
        if (/cita/i.test(text)) {
            const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const cita = await agenda_prisma_1.AgendaService.create("clinica123", {
                cliente: cliente?.nombre || "Cliente Retell",
                telefono: cliente?.telefono || "600000000",
                email: cliente?.email || "cliente@example.com",
                servicio: "Consulta general",
                fecha: fecha.toISOString(),
                duracion: 30,
                estado: "PENDIENTE",
                notas: `Reservado vía Retell AI (sessionId: ${sessionId})`,
            });
            await (0, notifyService_1.sendWhatsApp)(cita.telefono, cita);
            await (0, calendarService_1.createCalendarEvent)(cita);
            return res.json({
                reply: `✅ Tu cita ha sido creada para ${fecha.toLocaleString("es-ES")}. Te enviamos confirmación por WhatsApp.`,
            });
        }
        return res.json({ reply: "¿Quieres reservar, cancelar o pedir información?" });
    }
    catch (err) {
        console.error("❌ Error en Retell webhook:", err);
        return res.status(500).json({ error: "Error interno en el webhook" });
    }
});
//# sourceMappingURL=router-retell.js.map