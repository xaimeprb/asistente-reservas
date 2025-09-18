import { Cita } from '../core/domain';

/**
 * Devuelve un texto de confirmación de cita
 * adaptado a tu modelo actual de Cita.
 */
export function formatConfirmation(c: Cita): string {
  return `Perfecto, le confirmo: ${c.fecha} (${c.duracion} minutos) para ${c.servicio}, a nombre de ${c.cliente.nombre}, teléfono ${c.cliente.telefono}. ¿Es correcto?`;
}
