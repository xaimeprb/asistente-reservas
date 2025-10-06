type STTProvider = 'whisper' | 'assemblyai';
type TTSProvider = 'elevenlabs' | 'azure';
export declare const config: {
    port: number;
    nodeEnv: string;
    baseUrl: string;
    providers: {
        stt: STTProvider;
        tts: TTSProvider;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    openai: {
        apiKey: string;
        model: string;
        whisperModel: string;
    };
    assemblyai: {
        apiKey: string;
    };
    elevenlabs: {
        apiKey: string;
        voiceId: string;
    };
    azure: {
        speechKey: string;
        speechRegion: string;
        ttsVoice: string;
    };
    agenda: {
        timezone: string;
        businessHoursStart: string;
        businessHoursEnd: string;
        defaultDuration: number;
    };
    smtp: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
};
export {};
//# sourceMappingURL=config.d.ts.map