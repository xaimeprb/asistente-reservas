"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntentAndSlots = detectIntentAndSlots;
async function detectIntentAndSlots(texto) {
    const t = texto.toLowerCase().trim();
    const slots = {};
    let intent = { name: "duda", confidence: 0, slots: {} };
    if (/reserv(ar|a)/.test(t) || /cita/.test(t))
        intent = { name: "reservar", confidence: 0.9, slots: {} };
    else if (/modific(ar|a)/.test(t))
        intent = { name: "modificar", confidence: 0.9, slots: {} };
    else if (/cancel(ar|a)/.test(t))
        intent = { name: "cancelar", confidence: 0.9, slots: {} };
    else if (/precio|horario|direcci|dónde|teléfono|llamar/.test(t))
        intent = { name: "informacion", confidence: 0.9, slots: {} };
    const tel = t.match(/(\+?\d[\d\s]{7,}\d)/);
    if (tel)
        slots["telefono"] = tel[1].replace(/\s+/g, "");
    const fechaMatch = t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/) ||
        t.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
    if (fechaMatch) {
        if (fechaMatch[3]?.startsWith("20")) {
            const [_, d, m, y] = fechaMatch;
            slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
        else {
            const [_, y, m, d] = fechaMatch;
            slots["fecha"] = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
    }
    const horaMatch = t.match(/\b([01]?\d|2[0-3]):?([0-5]\d)?\b/) ||
        t.match(/\ba\s+las\s+(\d{1,2})(?:\s*y\s+media)?\b/);
    if (horaMatch) {
        const h = horaMatch[1].padStart(2, "0");
        const m = horaMatch[2] ? horaMatch[2].padStart(2, "0") : "00";
        slots["hora"] = `${h}:${m}`;
    }
    if (/fisio|fisioterap/.test(t))
        slots["servicio"] = "Fisioterapia";
    if (/corte|tinte|pelu/.test(t))
        slots["servicio"] = "Peluquería";
    if (/dental|dentista|limpieza/.test(t))
        slots["servicio"] = "Limpieza dental";
    return { intent, slots };
}
//# sourceMappingURL=detectIntentAndSlots.js.map