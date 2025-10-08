// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { router } from './router';
import { authRouter } from './authRouter';
import { adminRouter } from './router-admin';
import { retellRouter } from './router/retellRouter';
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

  // =============================
  //   RUTAS PRINCIPALES API
  // =============================

  // Rutas de negocio (multi-tenant)
  app.use('/api', router);

  // Webhook Retell (multi-tenant)
  app.use('/api/retell', retellRouter);

  // Rutas administrativas y auth
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  // 404 genérico
  app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

  // Manejador de errores
  app.use(errorHandler);

  return app;
}
