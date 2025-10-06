export interface CitaInput {
    cliente: string;
    telefono: string;
    email?: string | null;
    servicio: string;
    fecha: string;
    duracion?: number;
    estado?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
    notas?: string | null;
}
//# sourceMappingURL=cita-input.d.ts.map