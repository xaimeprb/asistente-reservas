import { EstadoCita } from '@prisma/client';
import { CitaInput } from '../types/cita-input';
export declare const AgendaService: {
    list(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getById(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resolveByTelefonoFecha(tenantId: string, telefono: string, fechaISO: string): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(tenantId: string, data: CitaInput): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(tenantId: string, id: string, data: Partial<CitaInput>): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(tenantId: string, id: string): Promise<boolean>;
    findByEstado(tenantId: string, estado: EstadoCita): Promise<{
        id: string;
        tenantId: string;
        cliente: string;
        telefono: string;
        email: string | null;
        servicio: string;
        fecha: Date;
        duracion: number;
        estado: import(".prisma/client").$Enums.EstadoCita;
        notas: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    stats(tenantId: string): Promise<{
        total: number;
        porEstado: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CitaGroupByOutputType, "estado"[]> & {
            _count: {
                estado: number;
            };
        })[];
    }>;
};
//# sourceMappingURL=agenda-prisma.d.ts.map