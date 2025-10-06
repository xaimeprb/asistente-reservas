"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
exports.UserService = {
    async create(email, password, tenantId, role = 'ADMIN') {
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        return prisma.user.create({
            data: { email, passwordHash, tenantId, role },
        });
    },
    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    },
    async validatePassword(user, password) {
        return bcryptjs_1.default.compare(password, user.passwordHash);
    },
};
//# sourceMappingURL=userService.js.map