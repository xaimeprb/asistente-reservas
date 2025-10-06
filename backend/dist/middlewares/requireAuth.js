"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const authService_1 = require("../services/authService");
function requireAuth(roles = []) {
    return (req, res, next) => {
        const token = req.cookies?.token ||
            req.headers['authorization']?.toString().split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        const decoded = authService_1.AuthService.verifyToken(token);
        if (!decoded) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = decoded;
        if (roles.length && !roles.includes(decoded.role)) {
            return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
        }
        return next();
    };
}
//# sourceMappingURL=requireAuth.js.map