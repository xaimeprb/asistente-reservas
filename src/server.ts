import express from 'express';
import cookieParser from 'cookie-parser';
import { router } from './router';
import { authRouter } from './authRouter';
import { adminRouter } from './router-admin';
import { errorHandler } from './middlewares/errorHandler';
import { retellRouter } from "./router-retell";

export function createServer() {
  const app = express();

  // Middlewares básicos
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser()); // habilitamos cookies (útil para JWT, sesiones…)

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      message: '📞 Bienvenido al Asistente de Reservas Multi-Tenant',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  // Rutas principales
  app.use('/api', router);           // clientes (reservas, diálogo…)
  app.use('/api/auth', authRouter);  // login, register
  app.use('/api/admin', adminRouter); // panel admin
  app.use("/api/retell", retellRouter);

  // Middleware global de errores
  app.use(errorHandler);

  return app;
}
