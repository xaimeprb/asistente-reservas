"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const app = (0, server_1.createServer)();
const portEnv = process.env['PORT'] ?? '8080';
const port = Number(portEnv);
if (!Number.isFinite(port))
    throw new Error(`PORT inválido: "${portEnv}"`);
const host = '0.0.0.0';
const server = app.listen(port, host, () => {
    console.log(`🚀 API listening on http://${host}:${port}`);
});
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
console.log('ℹ️ Recordatorios (Twilio) desactivados en este entorno');
//# sourceMappingURL=index.js.map