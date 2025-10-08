"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const router_1 = require("./router");
const authRouter_1 = require("./authRouter");
const router_admin_1 = require("./router-admin");
const router_retell_1 = require("./router-retell");
const errorHandler_1 = require("./middlewares/errorHandler");
function createServer() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)('tiny'));
    app.get('/', (_req, res) => {
        res.json({
            service: 'asistente-reservas',
            ok: true,
            docs: '/health',
        });
    });
    app.get('/health', (_req, res) => res.status(200).send('ok'));
    app.use('/api', router_1.router);
    app.use('/api/retell', router_retell_1.retellRouter);
    app.use('/api/auth', authRouter_1.authRouter);
    app.use('/api/admin', router_admin_1.adminRouter);
    app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=server.js.map