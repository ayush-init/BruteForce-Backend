"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSyncQueueEvents = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const syncStatus_1 = require("../utils/syncStatus");
const batchQuestions_store_1 = require("../store/batchQuestions.store");
// Initialize QueueEvents for completion detection
exports.studentSyncQueueEvents = new bullmq_1.QueueEvents("student-sync", {
    connection: redis_1.redisConnection,
});
// Handle queue drained event (all jobs completed)
exports.studentSyncQueueEvents.on("drained", async () => {
    console.log("[SYNC] All jobs completed");
    // Mark sync as completed
    (0, syncStatus_1.completeSync)();
    // Clear batch questions from memory
    (0, batchQuestions_store_1.clearBatchQuestions)();
    console.log("[SYNC] Sync cycle completed and memory cleared");
});
// Handle job completion for detailed logging
exports.studentSyncQueueEvents.on("completed", (job) => {
    console.log(`[SYNC] Job ${job.jobId} completed`);
});
// Handle job failures
exports.studentSyncQueueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`[SYNC] Job ${jobId} failed: ${failedReason}`);
});
// Graceful shutdown
process.on("SIGINT", async () => {
    await exports.studentSyncQueueEvents.close();
    console.log("[SYNC] Queue events closed");
});
process.on("SIGTERM", async () => {
    await exports.studentSyncQueueEvents.close();
    console.log("[SYNC] Queue events closed");
});
exports.default = exports.studentSyncQueueEvents;
