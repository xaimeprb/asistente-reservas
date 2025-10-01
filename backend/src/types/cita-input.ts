export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface CitaInput {
  cliente: string;
  telefono: string;
  email?: string;
  servicio: string;
  fecha: string; // ISO string
  duracion?: number;
  estado?: EstadoCita;
  notas?: string;
}
