import { Router, Request, Response } from "express";
import { AgendaService } from "../services/agenda-prisma";
import { createEvent } from "../services/calendar.js";
import { sendWhatsAppConfirm } from "../services/whatsapp.js";

export const retellRouter = Router();

retellRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const { sessionId, text, tenantSlug, cliente } = req.body;

    // TODO: NLP → detectar intención (reservar, cancelar, etc.)
    const intent = text.toLowerCase().includes("cita") ? "reservar" : "otro";

    if (intent === "reservar") {
      const cita = await AgendaService.create(tenantSlug, {
        cliente: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        servicio: "Consulta", // simplificado
        fecha: new Date().toISOString(),
        duracion: 30,
        estado: "CONFIRMADA",
        notas: "",
      });

      // Guardar en Google Calendar
      await createEvent(cita);

      // Enviar confirmación por WhatsApp
      await sendWhatsAppConfirm(cliente.telefono, cita);

      return res.json({
        reply: `✅ Cita confirmada para ${cita.fecha}`,
      });
    }

    return res.json({ reply: "No entendí, ¿quieres reservar una cita?" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error procesando la solicitud" });
  }
});
