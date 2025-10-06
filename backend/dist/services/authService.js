"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env['JWT_SECRET'] || 'supersecret';
exports.AuthService = {
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '7d' });
    },
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch {
            return null;
        }
    }
};
//# sourceMappingURL=authService.js.map