import cron from "node-cron";
import { AgendaService } from "./agenda-prisma";
import { sendWhatsAppConfirm } from "./whatsapp";

cron.schedule("*/10 * * * *", async () => {
  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Buscar citas pendientes próximas (simplificado)
  const citas = await AgendaService.list(""); // Necesitarías pasar tenantId específico

  for (const cita of citas) {
    await sendWhatsAppConfirm(cita.telefono, {
      ...cita,
      servicio: `⏰ Recordatorio: ${cita.servicio}`,
    });
  }
});