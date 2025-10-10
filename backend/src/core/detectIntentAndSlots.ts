/**
 * NLP simple que detecta intención y extrae entidades.
 * Ahora entiende lenguaje natural: "mañana", "lunes", "el viernes", "a las 5", etc.
 */

import { DateTime } from "luxon";

type Intent = {
  name: string;
  confidence: number;
  slots?: Record<string, string>;
};

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

export async function detectIntentAndSlots(
  texto: string
): Promise<{ intent: Intent; slots: Record<string, string> }> {
  const t = texto.toLowerCase().trim();
  const slots: Record<string, string> = {};
  let intent: Intent = { name: "duda", confidence: 0.0, slots: {} };

  /* === INTENCIÓN === */
  if (/reserv(ar|a)|cita|pedir cita|quiero cita/.test(t))
    intent = { name: "reservar", confidence: 0.9, slots: {} };
  else if (/modific(ar|a)/.test(t))
    intent = { name: "modificar", confidence: 0.9, slots: {} };
  else if (/cancel(ar|a)/.test(t))
    intent = { name: "cancelar", confidence: 0.9, slots: {} };

  /* === DETECTAR SERVICIO === */
  if (/fisio|fisioterap/.test(t)) slots["servicio"] = "Fisioterapia";
  if (/pelu|corte|tinte/.test(t)) slots["servicio"] = "Peluquería";
  if (/dental|dentista/.test(t)) slots["servicio"] = "Dentista";

  /* === DETECTAR FECHA === */
  const now = DateTime.now().setZone("Europe/Madrid");

  if (/hoy/.test(t)) slots["fecha"] = now.toISODate();
  else if (/mañana/.test(t)) slots["fecha"] = now.plus({ days: 1 }).toISODate();
  else {
    // Día de la semana (lunes, martes, etc.)
    for (let i = 0; i < DIAS.length; i++) {
      const dia = DIAS[i];
      if (t.includes(dia)) {
        let diff = (i - now.weekday) % 7;
        if (diff <= 0) diff += 7; // siguiente semana si ya pasó
        slots["fecha"] = now.plus({ days: diff }).toISODate();
        break;
      }
    }

    // Fecha numérica tipo 29/10/2025 o 29-10-2025
    const fechaMatch =
      t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/) ||
      t.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
    if (fechaMatch) {
      if (fechaMatch[3]?.startsWith("20")) {
        const [_, d, m, y] = fechaMatch;
        slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else {
        const [_, y, m, d] = fechaMatch;
        slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    }
  }

  /* === DETECTAR HORA === */
  // Ejemplo: “a las 4”, “a las 16”, “a las 4:30”, “a las 5 de la tarde”
  const horaMatch = t.match(/(?:a\s+las\s+)?(\d{1,2})(?::(\d{2}))?/);
  if (horaMatch) {
    let h = parseInt(horaMatch[1]);
    const m = horaMatch[2] ? parseInt(horaMatch[2]) : 0;

    if (/tarde|pm/.test(t) && h < 12) h += 12;
    if (/mañana|am/.test(t) && h >= 12) h -= 12;

    slots["hora"] = `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  }

  return { intent, slots };
}
