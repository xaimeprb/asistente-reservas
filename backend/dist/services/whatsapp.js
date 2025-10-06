"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppConfirm = sendWhatsAppConfirm;
const twilio_1 = __importDefault(require("twilio"));
const client = (0, twilio_1.default)(process.env['TWILIO_ACCOUNT_SID'], process.env['TWILIO_AUTH_TOKEN']);
async function sendWhatsAppConfirm(to, cita) {
    await client.messages.create({
        from: "whatsapp:" + process.env['TWILIO_PHONE_NUMBER'],
        to: `whatsapp:${to}`,
        body: `Hola ${cita.cliente}, tu cita para ${cita.servicio} está confirmada el ${cita.fecha}.`,
    });
}
//# sourceMappingURL=whatsapp.js.map