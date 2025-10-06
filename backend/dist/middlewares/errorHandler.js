"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error('❌ Error:', err);
    if (res.headersSent) {
        return res.end();
    }
    return res.status(500).json({ error: 'Error interno del servidor' });
}
//# sourceMappingURL=errorHandler.js.map