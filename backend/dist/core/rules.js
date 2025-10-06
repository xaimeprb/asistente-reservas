"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRules = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const config_1 = require("../config");
class BusinessRules {
    static esHorarioLaboral(fecha) {
        const momentDate = moment_timezone_1.default.tz(fecha, config_1.config.agenda.timezone);
        const diaSemana = momentDate.day();
        if (!this.DIAS_LABORALES.includes(diaSemana)) {
            return false;
        }
        const start = (0, moment_timezone_1.default)(config_1.config.agenda.businessHoursStart, 'HH:mm');
        const end = (0, moment_timezone_1.default)(config_1.config.agenda.businessHoursEnd, 'HH:mm');
        return momentDate.isBetween(start, end, 'minute', '[]');
    }
    static validarCita(cita) {
        if (!cita.fecha)
            return { valida: false, error: 'Fecha requerida' };
        if (!cita.duracion)
            return { valida: false, error: 'Duración requerida' };
        if (!cita.cliente || typeof cita.cliente !== 'string' || cita.cliente.trim() === '')
            return { valida: false, error: 'Nombre del cliente requerido' };
        if (!cita.telefono || typeof cita.telefono !== 'string' || cita.telefono.trim() === '')
            return { valida: false, error: 'Teléfono del cliente requerido' };
        if (!cita.servicio)
            return { valida: false, error: 'Servicio requerido' };
        return { valida: true };
    }
}
exports.BusinessRules = BusinessRules;
BusinessRules.DIAS_LABORALES = [1, 2, 3, 4, 5];
BusinessRules.DIAS_FIN_SEMANA = [0, 6];
//# sourceMappingURL=rules.js.map