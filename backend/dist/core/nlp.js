"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntentAndSlots = detectIntentAndSlots;
async function detectIntentAndSlots(texto) {
    const t = texto.toLowerCase();
    const slots = {};
    let intent = { name: 'duda', confidence: 0, slots: {} };
    if (/reserv(ar|a)|cita/.test(t))
        intent = { name: 'reservar', confidence: 0.9, slots: {} };
    else if (/modific(ar|a)/.test(t))
        intent = { name: 'modificar', confidence: 0.9, slots: {} };
    else if (/cancel(ar|a)/.test(t))
        intent = { name: 'cancelar', confidence: 0.9, slots: {} };
    else if (/precio|horario|dirección|donde|cómo llegar|teléfono/.test(t))
        intent = { name: 'informacion', confidence: 0.9, slots: {} };
    const tel = t.match(/(\+?\d[\d\s]{7,}\d)/);
    if (tel)
        slots['telefono'] = tel[1]?.replace(/\s+/g, '') || '';
    const horaRegex = /(?:a\s*las\s*)?(\d{1,2})(?::|\.| y )?(\d{0,2})?/i;
    const horaMatch = t.match(horaRegex);
    if (horaMatch) {
        const hh = horaMatch[1]?.padStart(2, '0') || '00';
        const mm = horaMatch[2] ? horaMatch[2].padStart(2, '0') : '00';
        slots['hora'] = `${hh}:${mm}`;
    }
    const fechaRegex = /(?:el\s*)?(\d{1,2})(?:\s*(?:de|\/|\-)\s*)([a-záéíóú]+|\d{1,2})(?:\s*(?:de)?\s*)?(\d{4})?/i;
    const meses = {
        enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
        julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
        noviembre: 11, diciembre: 12
    };
    const fechaMatch = t.match(fechaRegex);
    if (fechaMatch) {
        let [_, d, m, y] = fechaMatch;
        let monthNum;
        if (isNaN(Number(m)))
            monthNum = meses[m.toLowerCase()] || new Date().getMonth() + 1;
        else
            monthNum = Number(m);
        const year = y ? Number(y) : new Date().getFullYear();
        const day = Number(d);
        const dateISO = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        slots['fecha'] = dateISO;
    }
    if (/limpieza|dental/.test(t))
        slots['servicio'] = 'Limpieza dental';
    if (/corte|tinte|pelu/.test(t))
        slots['servicio'] = 'Peluquería';
    if (/fisio|fisioterap/.test(t))
        slots['servicio'] = 'Fisioterapia';
    return { intent, slots };
}
//# sourceMappingURL=nlp.js.map