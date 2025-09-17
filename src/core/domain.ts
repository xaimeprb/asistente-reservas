// Tipos de dominio para el asistente de reservas

export interface Intent {
  name: string;
  confidence: number;
  slots: Record<string, Slot>;
}

export interface Slot {
  name: string;
  value: string;
  confidence: number;
  rawValue?: string;
}

export interface Cita {
  id: string;
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  servicio: string;
  fecha: Date;
  duracion: number; // en minutos
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
  keywords: string[];
  activa: boolean;
}

export interface HorarioDisponible {
  fecha: Date;
  horarios: string[]; // formato HH:mm
}

export interface RespuestaAsistente {
  mensaje: string;
  intencion: string;
  necesitaConfirmacion: boolean;
  datosCita?: Partial<Cita>;
  siguienteAccion?: string;
}

export interface ContextoConversacion {
  sessionId: string;
  cliente?: {
    nombre?: string;
    telefono?: string;
    email?: string;
  };
  citaEnProceso?: Partial<Cita>;
  historial: string[];
  ultimaIntencion?: string;
}
