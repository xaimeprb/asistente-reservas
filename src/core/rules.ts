import moment from 'moment-timezone';
import { config } from '../config';
import { Cita } from './domain';

export class BusinessRules {
  private static readonly DIAS_LABORALES = [1, 2, 3, 4, 5]; // Lunes a Viernes
  private static readonly DIAS_FIN_SEMANA = [0, 6]; // Domingo y Sábado

  static esHorarioLaboral(fecha: Date): boolean {
    const momentDate = moment.tz(fecha, config.agenda.timezone);
    const diaSemana = momentDate.day();

    if (!this.DIAS_LABORALES.includes(diaSemana)) {
      return false;
    }

    const start = moment(config.agenda.businessHoursStart, 'HH:mm');
    const end = moment(config.agenda.businessHoursEnd, 'HH:mm');

    return momentDate.isBetween(start, end, 'minute', '[]');
  }

  static validarCita(cita: Partial<Cita>): { valida: boolean; error?: string } {
    if (!cita.fecha) return { valida: false, error: 'Fecha requerida' };
    if (!cita.duracion) return { valida: false, error: 'Duración requerida' };
    if (!cita.cliente || !cita.cliente.nombre) return { valida: false, error: 'Nombre del cliente requerido' };
    if (!cita.cliente || !cita.cliente.telefono) return { valida: false, error: 'Teléfono del cliente requerido' };
    if (!cita.servicio) return { valida: false, error: 'Servicio requerido' };
  
    return { valida: true };
  }
}
