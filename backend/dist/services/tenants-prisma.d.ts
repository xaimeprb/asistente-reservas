export declare const TenantService: {
    list(): Promise<{
        id: string;
        telefono: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        slug: string;
        direccion: string | null;
        defaultService: string;
        tipoNegocio: string;
    }[]>;
    get(id: string): Promise<{
        id: string;
        telefono: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        slug: string;
        direccion: string | null;
        defaultService: string;
        tipoNegocio: string;
    }>;
    getBySlug(slug: string): Promise<{
        id: string;
        telefono: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        slug: string;
        direccion: string | null;
        defaultService: string;
        tipoNegocio: string;
    }>;
    create(input: {
        nombre: string;
        direccion?: string;
        telefono?: string;
        email?: string;
    }): Promise<{
        id: string;
        telefono: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        slug: string;
        direccion: string | null;
        defaultService: string;
        tipoNegocio: string;
    }>;
    remove(id: string): Promise<boolean>;
};
//# sourceMappingURL=tenants-prisma.d.ts.map