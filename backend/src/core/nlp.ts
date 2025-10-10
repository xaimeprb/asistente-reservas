import { Intent } from "../domain";

/**
 * Extrae intent y entidades (fecha, hora, servicio, teléfono) de texto libre.
 * Soporta expresiones naturales en español como:
 * "el 29/10/2025 a las 10", "mañana a las 9:30", etc.
 */
export async function detectIntentAndSlots(
  texto: string
): Promise<{ intent: Intent; slots: Record<string, string> }> {
  const t = texto.toLowerCase().trim();
  const slots: Record<string, string> = {};
  let intent: Intent = { name: "duda", confidence: 0, slots: {} };

  // --- Intención principal ---
  if (/reserv(ar|a)/.test(t) || /cita/.test(t))
    intent = { name: "reservar", confidence: 0.9, slots: {} };
  else if (/modific(ar|a)/.test(t))
    intent = { name: "modificar", confidence: 0.9, slots: {} };
  else if (/cancel(ar|a)/.test(t))
    intent = { name: "cancelar", confidence: 0.9, slots: {} };
  else if (/precio|horario|direcci|dónde|teléfono|llamar/.test(t))
    intent = { name: "informacion", confidence: 0.9, slots: {} };

  // --- Teléfono ---
  const tel = t.match(/(\+?\d[\d\s]{7,}\d)/);
  if (tel) slots["telefono"] = tel[1].replace(/\s+/g, "");

  // --- Fecha (dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd) ---
  const fecha =
    t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/) ||
    t.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);

  if (fecha) {
    if (fecha[3].startsWith("20")) {
      // formato dd/mm/yyyy
      const [_, d, m, y] = fecha;
      slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    } else {
      // formato yyyy-mm-dd
      const [_, y, m, d] = fecha;
      slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  // --- Hora (HH:mm, H:mm, H) ---
  const hora =
    t.match(/\b([01]?\d|2[0-3]):?([0-5]\d)?\b/) ||
    t.match(/\b(a\s+las\s+(\d{1,2})(?:\s*y\s+media)?)\b/);

  if (hora) {
    let h: string;
    let m: string;
    if (hora[2] && /^[0-5]\d$/.test(hora[2])) {
      h = hora[1].padStart(2, "0");
      m = hora[2];
    } else {
      h = hora[1].padStart(2, "0");
      m = hora[2] ? hora[2].padStart(2, "0") : "00";
    }
    slots["hora"] = `${h}:${m}`;
  }

  // --- Servicio ---
  if (/fisio|fisioterap/.test(t)) slots["servicio"] = "Fisioterapia";
  if (/corte|tinte|pelu/.test(t)) slots["servicio"] = "Peluquería";
  if (/dental|dentista|limpieza/.test(t)) slots["servicio"] = "Limpieza dental";

  return { intent, slots };
}
