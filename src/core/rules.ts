// Reglas de negocio y horarios

import moment from 'moment-timezone';
import { config } from '../config';

export class BusinessRules {
  private static readonly DIAS_LABORALES = [1, 2, 3, 4, 5]; // Lunes a Viernes
  private static readonly DIAS_FIN_SEMANA = [0, 6]; // Domingo y Sábado

  /**
   * Verifica si una fecha está dentro del horario de atención
   */
  static esHorarioLaboral(fecha: Date): boolean {
    const momentDate = moment.tz(fecha, config.agenda.timezone);
    const diaSemana = momentDate.day();
    const hora = momentDate.format('HH:mm');

    // Verificar si es día laboral
    if (!this.DIAS_LABORALES.includes(diaSemana)) {
      return false;
    }

    // Verificar horario de atención
    return hora >= config.agenda.businessHoursStart && 
           hora <= config.agenda.businessHoursEnd;
  }

  /**
   * Obtiene el próximo horario disponible
   */
  static obtenerProximoHorarioDisponible(fecha: Date): Date {
    const momentDate = moment.tz(fecha, config.agenda.timezone);
    
    // Si es fin de semana, ir al próximo lunes
    if (this.DIAS_FIN_SEMANA.includes(momentDate.day())) {
      momentDate.day(1); // Lunes
      momentDate.hour(9).minute(0).second(0);
      return momentDate.toDate();
    }

    // Si es fuera del horario laboral, ir al próximo día hábil
    if (!this.esHorarioLaboral(fecha)) {
      if (momentDate.format('HH:mm') < config.agenda.businessHoursStart) {
        // Muy temprano, usar el mismo día
        momentDate.hour(9).minute(0).second(0);
      } else {
        // Muy tarde, ir al próximo día
        momentDate.add(1, 'day');
        momentDate.hour(9).minute(0).second(0);
      }
    }

    return momentDate.toDate();
  }

  /**
   * Valida si una cita puede ser agendada
   */
  static validarCita(cita: Partial<any>): { valida: boolean; error?: string } {
    if (!cita.fecha) {
      return { valida: false, error: 'Fecha requerida' };
    }

    if (!this.esHorarioLaboral(cita.fecha)) {
      return { valida: false, error: 'Fuera del horario de atención' };
    }

    if (!cita.cliente?.nombre) {
      return { valida: false, error: 'Nombre del cliente requerido' };
    }

    if (!cita.cliente?.telefono) {
      return { valida: false, error: 'Teléfono del cliente requerido' };
    }

    if (!cita.servicio) {
      return { valida: false, error: 'Servicio requerido' };
    }

    return { valida: true };
  }

  /**
   * Calcula la duración de un servicio
   */
  static obtenerDuracionServicio(servicio: string): number {
    const duraciones: Record<string, number> = {
      'consulta': 30,
      'revision': 45,
      'tratamiento': 60,
      'limpieza': 30,
      'extraccion': 45
    };

    return duraciones[servicio.toLowerCase()] || config.agenda.defaultDuration;
  }
}
