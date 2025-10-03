// src/index.ts
import { createServer } from './server';

const app = createServer();

// Cloud Run: puerto/IP
const portEnv = process.env['PORT'] ?? '8080';
const port = Number(portEnv);
if (!Number.isFinite(port)) throw new Error(`PORT inválido: "${portEnv}"`);
const host = '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`🚀 API listening on http://${host}:${port}`);
});

// Cierre limpio
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// (Recordatorios/Twilio desactivados)
console.log('ℹ️ Recordatorios (Twilio) desactivados en este entorno');
