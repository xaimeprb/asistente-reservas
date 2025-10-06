"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
console.log('--- Configuración cargada ---');
console.log('Puerto:', config_1.config.port);
console.log('Entorno:', config_1.config.nodeEnv);
console.log('Base URL:', config_1.config.baseUrl);
console.log('Proveedor STT:', config_1.config.providers.stt);
console.log('Proveedor TTS:', config_1.config.providers.tts);
console.log('Twilio SID:', config_1.config.twilio.accountSid ? 'OK' : 'Falta');
console.log('OpenAI Key:', config_1.config.openai.apiKey ? 'OK' : 'Falta');
console.log('SMTP User:', config_1.config.smtp.user ? 'OK' : 'Falta');
//# sourceMappingURL=config-check.js.map