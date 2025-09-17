import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { router } from './router';

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());

// Middlewares de logging
app.use(morgan('combined'));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/', router);

// Middleware de manejo de errores
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

export { app };
