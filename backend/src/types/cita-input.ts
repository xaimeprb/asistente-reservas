export interface CitaInput {
  cliente: string;
  telefono: string;
  email?: string | null;
  servicio: string;
  fecha: string;       // ISO
  duracion?: number;
  estado?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  notas?: string | null;
}
