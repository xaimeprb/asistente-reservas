import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { config } from '../config';

/**
 * Enviar SMS usando Twilio
 */
export async function sendSms(to: string, message: string) {
  try {
    if (!config.twilio.accountSid || !config.twilio.authToken || !config.twilio.phoneNumber) {
      console.log('[SMS] Twilio no configurado, se omite.');
      return;
    }

    const client = twilio(config.twilio.accountSid, config.twilio.authToken);

    await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to,
    });

    console.log(`[SMS] Enviado a ${to}`);
  } catch (error) {
    console.error('[SMS] Error al enviar:', error);
  }
}

/**
 * Enviar Email usando Nodemailer (SMTP)
 */
export async function sendEmail(to: string, subject: string, text: string) {
  try {
    if (!config.smtp?.user || !config.smtp?.pass) {
      console.log('[Email] SMTP no configurado, se omite.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // STARTTLS
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    await transporter.sendMail({
      from: `"Asistente de reservas" <${config.smtp.user}>`,
      to,
      subject,
      text,
    });

    console.log(`[Email] Enviado a ${to}`);
  } catch (error) {
    console.error('[Email] Error al enviar:', error);
  }
}
