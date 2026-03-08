"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStudentSyncWorker = runStudentSyncWorker;
const prisma_1 = __importDefault(require("../config/prisma"));
const progressSync_service_1 = require("../services/progressSync.service");
async function runStudentSyncWorker() {
    console.log("🚀 Student sync worker started");
    // 4 hours ago
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    // Fetch only students that actually need syncing
    const students = await prisma_1.default.student.findMany({
        where: {
            batch_id: { not: null },
            OR: [
                { last_synced_at: null },
                {
                    last_synced_at: {
                        lt: fourHoursAgo
                    }
                }
            ]
        },
        select: {
            id: true
        }
    });
    console.log(`Students needing sync: ${students.length}`);
    const BATCH_SIZE = 5;
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const batch = students.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(student => (0, progressSync_service_1.syncOneStudent)(student.id).catch(err => {
            console.error(`❌ Failed syncing student ${student.id}`, err);
        })));
        console.log(`Processed ${Math.min(i + BATCH_SIZE, students.length)} students`);
    }
    console.log("✅ Student sync worker finished");
}
