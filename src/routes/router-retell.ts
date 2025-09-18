import express, { Request, Response } from "express";
import { z } from "zod";
// @ts-ignore: El servicio puede no estar presente en tiempo de desarrollo
import { AgendaService } from "./services/agenda-prisma";
// @ts-ignore: El servicio puede no estar presente en tiempo de desarrollo
import { sendWhatsApp } from "./services/notifyService";
// @ts-ignore: El servicio puede no estar presente en tiempo de desarrollo
import { createCalendarEvent } from "./services/calendarService";

export const retellRouter = express.Router();

// 🔒 esquema de validación con zod
const webhookSchema = z.object({
  sessionId: z.string(),
  text: z.string(),
  cliente: z
    .object({
      nombre: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});

retellRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    // ✅ Validación de entrada
    const parsed = webhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Payload inválido" });
    }
    const { sessionId, text, cliente } = parsed.data;

    // 🔐 seguridad extra: validar secreto
    const authHeader = req.headers.authorization;
    if (process.env['RETELL_API_SECRET'] && authHeader !== `Bearer ${process.env['RETELL_API_SECRET']}`) {
      return res.status(403).json({ error: "Acceso no autorizado" });
    }

    // 🧠 detección simple: si pide cita
    if (/cita/i.test(text)) {
      const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // mañana por defecto
      const cita = await AgendaService.create("clinica123", {
        cliente: cliente?.nombre || "Cliente Retell",
        telefono: cliente?.telefono || "600000000",
        email: cliente?.email || "cliente@example.com",
        servicio: "Consulta general",
        fecha: fecha.toISOString(),
        duracion: 30,
        estado: "PENDIENTE",
        notas: `Reservado vía Retell AI (sessionId: ${sessionId})`,
      });

      // 📲 Enviar WhatsApp de confirmación
      await sendWhatsApp(cita.telefono, cita);

      // 📅 Guardar en Google Calendar
      await createCalendarEvent(cita);

      return res.json({
        reply: `✅ Tu cita ha sido creada para ${fecha.toLocaleString("es-ES")}. Te enviamos confirmación por WhatsApp.`,
      });
    }

    return res.json({ reply: "¿Quieres reservar, cancelar o pedir información?" });
  } catch (err: any) {
    console.error("❌ Error en Retell webhook:", err);
    return res.status(500).json({ error: "Error interno en el webhook" });
  }
});
