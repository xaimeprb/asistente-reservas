"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
const prisma = new client_1.PrismaClient();
exports.TenantService = {
    async list() {
        return prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    async get(id) {
        return prisma.tenant.findUnique({
            where: { id },
        });
    },
    async getBySlug(slug) {
        return prisma.tenant.findUnique({
            where: { slug },
        });
    },
    async create(input) {
        if (!input.nombre) {
            throw new Error('datos-incompletos');
        }
        try {
            let baseSlug = (0, slugify_1.default)(input.nombre, { lower: true, strict: true });
            let slug = baseSlug;
            let i = 1;
            while (await prisma.tenant.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${i++}`;
            }
            const tenant = await prisma.tenant.create({
                data: {
                    nombre: input.nombre,
                    slug,
                    direccion: input.direccion || null,
                    telefono: input.telefono || null,
                    email: input.email || null,
                },
            });
            return tenant;
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new Error('tenant-existe');
            }
            throw e;
        }
    },
    async remove(id) {
        try {
            await prisma.tenant.delete({
                where: { id },
            });
            return true;
        }
        catch (e) {
            if (e.code === 'P2025') {
                throw new Error('tenant-no-existe');
            }
            throw e;
        }
    },
};
//# sourceMappingURL=tenants-prisma.js.map