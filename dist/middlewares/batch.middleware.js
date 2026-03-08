"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBatch = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const resolveBatch = async (req, res, next) => {
    const { batchSlug } = req.params;
    if (!batchSlug || Array.isArray(batchSlug)) {
        return res.status(400).json({ error: "Invalid batch slug" });
    }
    const batch = await prisma_1.default.batch.findUnique({
        where: { slug: batchSlug },
    });
    if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
    }
    req.batch = batch;
    next();
};
exports.resolveBatch = resolveBatch;
