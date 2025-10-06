"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = sendSms;
exports.sendEmail = sendEmail;
const twilio_1 = __importDefault(require("twilio"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
async function sendSms(to, message) {
    try {
        if (!config_1.config.twilio.accountSid || !config_1.config.twilio.authToken || !config_1.config.twilio.phoneNumber) {
            console.log('[SMS] Twilio no configurado, se omite.');
            return;
        }
        const client = (0, twilio_1.default)(config_1.config.twilio.accountSid, config_1.config.twilio.authToken);
        await client.messages.create({
            body: message,
            from: config_1.config.twilio.phoneNumber,
            to,
        });
        console.log(`[SMS] Enviado a ${to}`);
    }
    catch (error) {
        console.error('[SMS] Error al enviar:', error);
    }
}
async function sendEmail(to, subject, text) {
    try {
        if (!config_1.config.smtp?.user || !config_1.config.smtp?.pass) {
            console.log('[Email] SMTP no configurado, se omite.');
            return;
        }
        const transporter = nodemailer_1.default.createTransport({
            host: config_1.config.smtp.host,
            port: config_1.config.smtp.port,
            secure: false,
            auth: {
                user: config_1.config.smtp.user,
                pass: config_1.config.smtp.pass,
            },
        });
        await transporter.sendMail({
            from: `"Asistente de reservas" <${config_1.config.smtp.user}>`,
            to,
            subject,
            text,
        });
        console.log(`[Email] Enviado a ${to}`);
    }
    catch (error) {
        console.error('[Email] Error al enviar:', error);
    }
}
//# sourceMappingURL=notify.js.map