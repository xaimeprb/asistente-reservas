import dotenv from 'dotenv';
dotenv.config();

type STTProvider = 'whisper' | 'assemblyai';
type TTSProvider = 'elevenlabs' | 'azure';

function req(name: string, value: string | undefined, when: boolean) {
  if (when && (!value || value.trim() === '')) {
    throw new Error(`[config] Falta la variable de entorno: ${name}`);
  }
}

const sttProvider = (process.env.STT_PROVIDER as STTProvider) || 'whisper';
const ttsProvider = (process.env.TTS_PROVIDER as TTSProvider) || 'elevenlabs';

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',

  // Proveedores activos
  providers: {
    stt: sttProvider,
    tts: ttsProvider,
  },

  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // OpenAI (LLM + Whisper STT opcional)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    whisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  },

  // STT
  assemblyai: {
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
  },

  // TTS
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '',
  },

  azure: {
    speechKey: process.env.AZURE_SPEECH_KEY || '',
    speechRegion: process.env.AZURE_SPEECH_REGION || '',
    ttsVoice: process.env.AZURE_TTS_VOICE || 'es-ES-AlvaroNeural',
  },

  // Agenda
  agenda: {
    timezone: process.env.DEFAULT_TIMEZONE || 'Europe/Madrid',
    businessHoursStart: process.env.BUSINESS_HOURS_START || '10:00',
    businessHoursEnd: process.env.BUSINESS_HOURS_END || '20:00',
    defaultDuration: parseInt(process.env.DEFAULT_APPOINTMENT_DURATION || '30', 10),
  },
};

// === Validaciones mínimas según proveedores elegidos ===
const usingTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_PHONE_NUMBER);
if (usingTwilio) {
  req('TWILIO_ACCOUNT_SID', config.twilio.accountSid, true);
  req('TWILIO_AUTH_TOKEN', config.twilio.authToken, true);
  req('TWILIO_PHONE_NUMBER', config.twilio.phoneNumber, true);
}

// LLM siempre requerido si usas conversación
req('OPENAI_API_KEY', config.openai.apiKey, true);

// STT
req('OPENAI_WHISPER_MODEL', config.openai.whisperModel, sttProvider === 'whisper');
req('ASSEMBLYAI_API_KEY', config.assemblyai.apiKey, sttProvider === 'assemblyai');

// TTS
req('ELEVENLABS_API_KEY', config.elevenlabs.apiKey, ttsProvider === 'elevenlabs');
req('ELEVENLABS_VOICE_ID', config.elevenlabs.voiceId, ttsProvider === 'elevenlabs');
req('AZURE_SPEECH_KEY', config.azure.speechKey, ttsProvider === 'azure');
req('AZURE_SPEECH_REGION', config.azure.speechRegion, ttsProvider === 'azure');
