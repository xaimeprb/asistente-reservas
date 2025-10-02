import { createServer } from './server';
import { authRouter } from './authRouter';

const app = createServer();

// Health check para Cloud Run
app.get('/health', (_req, res) => res.status(200).send('ok'));

// Rutas (ajusta según lo que uses)
app.use('/api/auth', authRouter);

// Puerto/IP correctos para Cloud Run
const portEnv = process.env['PORT'] ?? '8080';
const port = Number(portEnv);
if (!Number.isFinite(port)) {
  throw new Error(`PORT inválido: "${portEnv}"`);
}
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

// Desactivamos Twilio / reminders de momento
console.log("ℹ️ Recordatorios (Twilio) desactivados en este entorno");
