// Servicio para WhatsApp con Twilio
import twilio from "twilio";
import { Cita } from "../generated/prisma";

const client = twilio(
  process.env["TWILIO_ACCOUNT_SID"]!,
  process.env["TWILIO_AUTH_TOKEN"]!
);

export async function sendWhatsApp(to: string, cita: Cita) {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env["TWILIO_PHONE_NUMBER"]!}`,
      to: `whatsapp:${to}`,
      body: `Hola ${cita.cliente}, tu cita para ${cita.servicio} está confirmada el ${new Date(
        cita.fecha
      ).toLocaleString("es-ES")}. Gracias por confiar en nosotros.`,
    });

    console.log(`📲 WhatsApp enviado a ${to}`);
  } catch (err) {
    console.error("❌ Error enviando WhatsApp:", err);
  }
}
