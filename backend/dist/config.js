"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env["PORT"] ?? 3000),
    nodeEnv: process.env["NODE_ENV"] ?? 'development',
    baseUrl: process.env["PUBLIC_BASE_URL"] ?? 'http://localhost:3000',
    providers: {
        stt: process.env["STT_PROVIDER"] ?? 'whisper',
        tts: process.env["TTS_PROVIDER"] ?? 'elevenlabs',
    },
    twilio: {
        accountSid: process.env["TWILIO_ACCOUNT_SID"] ?? '',
        authToken: process.env["TWILIO_AUTH_TOKEN"] ?? '',
        phoneNumber: process.env["TWILIO_PHONE_NUMBER"] ?? '',
    },
    openai: {
        apiKey: process.env["OPENAI_API_KEY"] ?? '',
        model: process.env["OPENAI_MODEL"] ?? 'gpt-4o-mini',
        whisperModel: process.env["OPENAI_WHISPER_MODEL"] ?? 'whisper-1',
    },
    assemblyai: {
        apiKey: process.env["ASSEMBLYAI_API_KEY"] ?? '',
    },
    elevenlabs: {
        apiKey: process.env["ELEVENLABS_API_KEY"] ?? '',
        voiceId: process.env["ELEVENLABS_VOICE_ID"] ?? '',
    },
    azure: {
        speechKey: process.env["AZURE_SPEECH_KEY"] ?? '',
        speechRegion: process.env["AZURE_SPEECH_REGION"] ?? '',
        ttsVoice: process.env["AZURE_TTS_VOICE"] ?? 'es-ES-AlvaroNeural',
    },
    agenda: {
        timezone: process.env["DEFAULT_TIMEZONE"] ?? 'Europe/Madrid',
        businessHoursStart: process.env["BUSINESS_HOURS_START"] ?? '10:00',
        businessHoursEnd: process.env["BUSINESS_HOURS_END"] ?? '20:00',
        defaultDuration: parseInt(process.env["DEFAULT_APPOINTMENT_DURATION"] ?? '30', 10),
    },
    smtp: {
        host: process.env["SMTP_HOST"] ?? '',
        port: Number(process.env["SMTP_PORT"] ?? 587),
        user: process.env["SMTP_USER"] ?? '',
        pass: process.env["SMTP_PASS"] ?? '',
    },
};
//# sourceMappingURL=config.js.map