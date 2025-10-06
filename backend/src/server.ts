// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { router } from './router';
import { authRouter } from './authRouter';
import { adminRouter } from './router-admin';
import { retellRouter } from './router-retell';
import { errorHandler } from './middlewares/errorHandler';

export function createServer() {
  const app = express();

  // Seguridad y utilidades
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan('tiny'));

  // Welcome + health
  app.get('/', (_req, res) => {
    res.json({
      service: 'asistente-reservas',
      ok: true,
      docs: '/health',
    });
  });
  app.get('/health', (_req, res) => res.status(200).send('ok'));

  // Rutas de negocio (SIN prefijo /api)
  // -> Quedan como "/:slug/citas", "/:slug/citas/resolve", etc.
  app.use('/', router);

// Webhook Retell -> "/api/retell/webhook/:slug"
app.use('/api/retell', retellRouter);

  // Rutas administrativas / auth (pueden ir con /api para separarlas)
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  // 404
  app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

  // Error handler unificado
  app.use(errorHandler);

  return app;
}
