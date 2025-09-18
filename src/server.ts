import express from 'express';
import { router } from './router';
import { errorHandler } from './middlewares/errorHandler';

export function createServer() {
  const app = express();

  app.use(express.json({ limit: '2mb' }));

  // Rutas principales
  app.use('/api', router);

  // Middleware de errores (debe ir al final)
  app.use(errorHandler);

  return app;
}

