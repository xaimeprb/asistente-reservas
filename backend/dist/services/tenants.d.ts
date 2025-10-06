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
    }[]>;
    getById(id: string): Promise<{
        id: string;
        telefono: string | null;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        slug: string;
        direccion: string | null;
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
    }>;
    create(data: {
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
    }>;
    remove(id: string): Promise<boolean>;
};
//# sourceMappingURL=tenants.d.ts.map