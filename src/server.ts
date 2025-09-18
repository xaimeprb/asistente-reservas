import express from "express";
import cookieParser from "cookie-parser";
import { router } from "./router";
import { authRouter } from "./authRouter";
import { adminRouter } from "./router-admin";
import { errorHandler } from "./middlewares/errorHandler";
import { retellRouter } from "./router-retell";

export function createServer() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.json({
      message: "📞 Bienvenido al Asistente de Reservas Multi-Tenant con Retell AI",
      version: "1.0.0",
      docs: "/api/health",
    });
  });

  app.use("/api", router);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/retell", retellRouter);

  app.use(errorHandler);

  return app;
}
