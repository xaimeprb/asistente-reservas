// src/services/confirmation.ts
import { CitaInput as Cita } from "../types/cita-input";

/**
 * Devuelve un texto amigable confirmando la cita
 */
export function formatConfirmation(c: Cita): string {
  const fecha = new Date(c.fecha).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `✅ Hola ${c.cliente || "usuario"}, tu cita para ${c.servicio} ha sido registrada el ${fecha}. Te contactaremos al teléfono ${c.telefono || "no proporcionado"}.`;
}
