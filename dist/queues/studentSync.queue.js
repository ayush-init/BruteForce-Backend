"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSyncQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
// Create BullMQ queue for student sync jobs
exports.studentSyncQueue = new bullmq_1.Queue('student-sync', {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 1000, // Start with 1 second delay
        },
    },
});
// Graceful shutdown
process.on('SIGINT', async () => {
    await exports.studentSyncQueue.close();
    console.log('[QUEUE] Student sync queue closed');
});
process.on('SIGTERM', async () => {
    await exports.studentSyncQueue.close();
    console.log('[QUEUE] Student sync queue closed');
});
exports.default = exports.studentSyncQueue;
