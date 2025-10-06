"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const userService_1 = require("./services/userService");
const authService_1 = require("./services/authService");
const tenants_1 = require("./services/tenants");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res) => {
    const { email, password, tenantId, tenantSlug } = req.body;
    let tenant = null;
    if (tenantId) {
        tenant = await tenants_1.TenantService.getById(tenantId);
    }
    else if (tenantSlug) {
        tenant = await tenants_1.TenantService.getBySlug(tenantSlug);
    }
    if (!tenant) {
        return res.status(400).json({ error: 'Tenant no válido' });
    }
    const user = await userService_1.UserService.create(email, password, tenant.id, 'ADMIN');
    return res.json({ ok: true, user });
});
exports.authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userService_1.UserService.findByEmail(email);
    if (!user || !(await userService_1.UserService.validatePassword(user, password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = authService_1.AuthService.generateToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ ok: true, message: 'Login correcto', token });
});
exports.authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ ok: true, message: 'Logout correcto' });
});
//# sourceMappingURL=authRouter.js.map