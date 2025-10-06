"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFAQs = getFAQs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_PATH = path_1.default.resolve('src/data/faqs.json');
function getFAQs() {
    if (!fs_1.default.existsSync(DATA_PATH))
        return {};
    return JSON.parse(fs_1.default.readFileSync(DATA_PATH, 'utf-8'));
}
//# sourceMappingURL=faqs.js.map