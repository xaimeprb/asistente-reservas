"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = sendWhatsApp;
const twilio_1 = __importDefault(require("twilio"));
const client = (0, twilio_1.default)(process.env["TWILIO_ACCOUNT_SID"], process.env["TWILIO_AUTH_TOKEN"]);
async function sendWhatsApp(to, cita) {
    try {
        await client.messages.create({
            from: `whatsapp:${process.env["TWILIO_PHONE_NUMBER"]}`,
            to: `whatsapp:${to}`,
            body: `Hola ${cita.cliente}, tu cita para ${cita.servicio} está confirmada el ${new Date(cita.fecha).toLocaleString("es-ES")}. Gracias por confiar en nosotros.`,
        });
        console.log(`📲 WhatsApp enviado a ${to}`);
    }
    catch (err) {
        console.error("❌ Error enviando WhatsApp:", err);
    }
}
//# sourceMappingURL=notifyService.js.map