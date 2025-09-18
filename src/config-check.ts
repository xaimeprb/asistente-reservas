import { config } from './config';

console.log('--- Configuración cargada ---');
console.log('Puerto:', config.port);
console.log('Entorno:', config.nodeEnv);
console.log('Base URL:', config.baseUrl);

console.log('Proveedor STT:', config.providers.stt);
console.log('Proveedor TTS:', config.providers.tts);

console.log('Twilio SID:', config.twilio.accountSid ? 'OK' : 'Falta');
console.log('OpenAI Key:', config.openai.apiKey ? 'OK' : 'Falta');
console.log('SMTP User:', config.smtp.user ? 'OK' : 'Falta');
