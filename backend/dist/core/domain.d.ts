export interface Intent {
    name: 'reservar' | 'modificar' | 'cancelar' | 'informacion' | 'duda';
    confidence: number;
    slots: Record<string, Slot>;
}
export interface Slot {
    name: string;
    value: string;
    confidence: number;
    rawValue?: string;
}
export declare enum EstadoCita {
    PENDIENTE = "PENDIENTE",
    CONFIRMADA = "CONFIRMADA",
    CANCELADA = "CANCELADA",
    COMPLETADA = "COMPLETADA"
}
export interface CitaInput {
    cliente: string;
    telefono: string;
    email?: string;
    servicio: string;
    fecha: string;
    duracion?: number;
    estado?: EstadoCita;
    notas?: string;
}
export interface Cita {
    id: string;
    tenantId: string;
    cliente: string;
    telefono: string;
    email?: string | null;
    servicio: string;
    fecha: Date;
    duracion: number;
    estado: EstadoCita;
    notas?: string | null;
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
    horarios: string[];
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
//# sourceMappingURL=domain.d.ts.map