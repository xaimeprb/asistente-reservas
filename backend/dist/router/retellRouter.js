"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retellRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const luxon_1 = require("luxon");
const nlp_1 = require("../core/nlp");
const agenda_prisma_1 = require("../services/agenda-prisma");
const tenants_1 = require("../services/tenants");
const calendarService_1 = require("../services/calendarService");
exports.retellRouter = express_1.default.Router();
const BodySchema = zod_1.z.object({
    sessionId: zod_1.z.string().optional(),
    text: zod_1.z.string().min(1, "texto requerido"),
    cliente: zod_1.z
        .object({
        nombre: zod_1.z.string().optional(),
        telefono: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
    })
        .optional(),
});
function parseFechaHora(fecha, hora, tz) {
    let fechaISO = fecha.trim();
    let horaISO = hora.trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaISO)) {
        const [d, m, y] = fechaISO.split("/");
        fechaISO = `${y}-${m}-${d}`;
    }
    else if (/^\d{2}-\d{2}-\d{4}$/.test(fechaISO)) {
        const [d, m, y] = fechaISO.split("-");
        fechaISO = `${y}-${m}-${d}`;
    }
    const match = horaISO.match(/^(\d{1,2})([:.]?(\d{2}))?$/);
    if (match) {
        const h = match[1].padStart(2, "0");
        const m = match[3] ? match[3].padStart(2, "0") : "00";
        horaISO = `${h}:${m}`;
    }
    if (horaISO === "24:00") {
        horaISO = "00:00";
        const d = luxon_1.DateTime.fromISO(fechaISO, { zone: tz }).plus({ days: 1 });
        fechaISO = d.toISODate();
    }
    const dt = luxon_1.DateTime.fromISO(`${fechaISO}T${horaISO}`, { zone: tz });
    if (!dt.isValid) {
        console.error("❌ Fecha/hora no válidas:", fechaISO, horaISO);
        throw new Error("invalid-fecha-hora");
    }
    console.log("🕐 Fecha parseada correctamente:", dt.toISO());
    return dt.toJSDate();
}
exports.retellRouter.post("/webhook/:slug", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const expected = process.env["RETELL_API_SECRET"];
        if (expected && authHeader !== `Bearer ${expected}`) {
            return res.status(403).json({ error: "Acceso no autorizado" });
        }
        const parsed = BodySchema.safeParse(req.body);
        if (!parsed.success) {
            console.error("❌ Body inválido:", parsed.error.format());
            return res.status(400).json({ error: "Payload inválido" });
        }
        const { sessionId, text, cliente } = parsed.data;
        const { slug } = req.params;
        if (!slug)
            return res.status(400).json({ reply: "⚠️ Falta el slug." });
        const tenant = await tenants_1.TenantService.getBySlug(slug);
        if (!tenant)
            return res.status(404).json({ reply: "⚠️ Negocio no encontrado." });
        const { intent, slots } = await (0, nlp_1.detectIntentAndSlots)(text || "");
        if (intent.name !== "reservar") {
            return res.json({
                reply: "¿Quieres reservar, modificar o cancelar una cita?",
                sessionId,
            });
        }
        const faltan = [];
        if (!slots["fecha"])
            faltan.push("la fecha");
        if (!slots["hora"])
            faltan.push("la hora");
        if (!cliente?.nombre)
            faltan.push("su nombre");
        if (!cliente?.telefono)
            faltan.push("su teléfono");
        const defaultService = tenant?.defaultService ?? "Consulta general";
        if (!slots["servicio"])
            slots["servicio"] = defaultService;
        if (faltan.length) {
            return res.json({
                reply: `Para confirmar la cita necesito ${faltan.join(", ")}.`,
                sessionId,
            });
        }
        const tz = process.env["DEFAULT_TIMEZONE"] ?? "Europe/Madrid";
        let fechaHora;
        try {
            fechaHora = parseFechaHora(String(slots["fecha"]), String(slots["hora"]), tz);
        }
        catch {
            return res.status(400).json({ reply: "⚠️ Fecha u hora inválida.", sessionId });
        }
        const cita = await agenda_prisma_1.AgendaService.create(tenant.id, {
            cliente: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente?.email ?? null,
            servicio: slots["servicio"],
            fecha: fechaHora.toISOString(),
            duracion: 30,
            estado: "PENDIENTE",
            notas: "",
        });
        try {
            await (0, calendarService_1.createCalendarEvent)(cita);
            console.log(`📅 Evento añadido en Google Calendar para ${cita.cliente}`);
        }
        catch (err) {
            console.error("⚠️ No se pudo crear el evento en Calendar:", err);
        }
        const fechaLocal = luxon_1.DateTime.fromJSDate(fechaHora).setZone(tz);
        const fechaOut = fechaLocal.toLocaleString(luxon_1.DateTime.DATE_FULL);
        const horaOut = fechaLocal.toFormat("HH:mm");
        return res.json({
            reply: `✅ Cita confirmada para ${fechaOut} a las ${horaOut} (${slots["servicio"]}).`,
            citaId: cita.id,
            cita,
            sessionId,
        });
    }
    catch (error) {
        console.error("💥 Error general en webhook Retell:", error);
        return res
            .status(500)
            .json({ reply: "❌ Error procesando la solicitud del webhook." });
    }
});
//# sourceMappingURL=retellRouter.js.map