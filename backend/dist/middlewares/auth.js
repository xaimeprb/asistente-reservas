"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const authService_1 = require("../services/authService");
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    try {
        const payload = authService_1.AuthService.verifyToken(token);
        req.user = payload;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
//# sourceMappingURL=auth.js.map