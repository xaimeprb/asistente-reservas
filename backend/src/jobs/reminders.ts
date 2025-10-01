import cron from "node-cron";
import { AgendaService } from "../services/agenda-prisma";
import twilio from "twilio";

export function initReminders(): void {
  const client = twilio(
    process.env['TWILIO_ACCOUNT_SID'],
    process.env['TWILIO_AUTH_TOKEN']
  );

  cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Buscar citas próximas (simplificado - necesitarías implementar findBetween)
    const citas = await AgendaService.list(""); // Pasar tenantId específico

    for (const cita of citas) {
      await client.messages.create({
        from: process.env['TWILIO_WHATSAPP_FROM']!,
        to: `whatsapp:${cita.telefono}`,
        body: `⏰ Recordatorio: tienes tu cita de ${cita.servicio} a las ${cita.fecha}`,
      });
    }
  });
}
