import { Intent } from './domain';

export async function detectIntentAndSlots(
  texto: string
): Promise<{ intent: Intent; slots: Record<string, string> }> {
  const t = texto.toLowerCase();
  const slots: Record<string, string> = {};
  let intent: Intent = { name: 'duda', confidence: 0, slots: {} };

  if (/reserv(ar|a)/.test(t) || /cita/.test(t)) intent = { name: 'reservar', confidence: 0, slots: {} };
  if (/modific(ar|a)/.test(t)) intent = { name: 'modificar', confidence: 0, slots: {} };
  if (/cancel(ar|a)/.test(t)) intent = { name: 'cancelar', confidence: 0, slots: {} };
  if (/precio|horario|dirección|donde|cómo llegar|teléfono/.test(t)) intent = { name: 'informacion', confidence: 0, slots: {} };

  // Extraer teléfono
  const tel = t.match(/(\+?\d[\d\s]{7,}\d)/);
  if (tel) slots['telefono'] = tel[1]?.replace(/\s+/g, '') || '';

  // Extraer hora (HH:mm)
  const hora = t.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  if (hora) slots['hora'] = hora[0];

  // Extraer fecha YYYY-MM-DD
  const fecha = t.match(/\b20\d{2}-\d{2}-\d{2}\b/);
  if (fecha) slots['fecha'] = fecha[0];

  // Servicio
  if (/limpieza|dental/.test(t)) slots['servicio'] = 'Limpieza dental';
  if (/corte|tinte|pelu/.test(t)) slots['servicio'] = 'Peluquería';
  if (/fisio|fisioterap/.test(t)) slots['servicio'] = 'Fisioterapia';

  return { intent, slots };
}
