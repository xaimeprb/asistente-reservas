"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConfirmation = formatConfirmation;
function formatConfirmation(c) {
    const fecha = new Date(c.fecha).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
    return `✅ Hola ${c.cliente || "usuario"}, tu cita para ${c.servicio} ha sido registrada el ${fecha}. Te contactaremos al teléfono ${c.telefono || "no proporcionado"}.`;
}
//# sourceMappingURL=confirmation.js.map