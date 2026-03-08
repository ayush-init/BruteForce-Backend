"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSync = manualSync;
const progressSync_service_1 = require("../services/progressSync.service");
async function manualSync(req, res) {
    try {
        const studentId = Number(req.params.id);
        const result = await (0, progressSync_service_1.syncOneStudent)(studentId);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}
