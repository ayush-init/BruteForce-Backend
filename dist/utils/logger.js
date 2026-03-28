"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta ? meta : "");
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
        if (error?.stack) {
            console.error(error.stack);
        }
        else if (error) {
            console.error(error);
        }
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta ? meta : "");
    },
};
