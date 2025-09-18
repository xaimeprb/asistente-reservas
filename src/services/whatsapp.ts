import twilio from "twilio";

const client = twilio(process.env['TWILIO_ACCOUNT_SID']!, process.env['TWILIO_AUTH_TOKEN']!);

export async function sendWhatsAppConfirm(to: string, cita: any) {
  await client.messages.create({
    from: "whatsapp:" + process.env['TWILIO_PHONE_NUMBER']!,
    to: `whatsapp:${to}`,
    body: `Hola ${cita.cliente}, tu cita para ${cita.servicio} está confirmada el ${cita.fecha}.`,
  });
}