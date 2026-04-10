"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Environment variables for Redis switching
const USE_CLOUD_REDIS = process.env.USE_CLOUD_REDIS === 'true';
const CLOUD_REDIS_URL = process.env.CLOUD_REDIS_URL || 'redis://username:password@your-cloud-host:port';
// Determine Redis connection based on boolean flag
let redisUrl;
let connectionType;
if (USE_CLOUD_REDIS) {
    redisUrl = CLOUD_REDIS_URL;
    connectionType = 'CLOUD';
}
else {
    redisUrl = 'redis://localhost:6379';
    connectionType = 'LOCAL';
}
console.log(`[REDIS] Using ${connectionType} Redis: ${redisUrl.replace(/\/\/.*@/, '//***@')}`);
console.log(`[REDIS] USE_CLOUD_REDIS=${USE_CLOUD_REDIS}`);
// Shared Redis connection for BullMQ and other services
exports.redisConnection = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: true,
});
// Handle connection events
exports.redisConnection.on('connect', () => {
    console.log(`[REDIS] Connected successfully to ${connectionType} Redis`);
});
exports.redisConnection.on('error', (err) => {
    console.error('[REDIS] Connection error:', err);
    if (connectionType === 'LOCAL') {
        console.log('[REDIS] TIP: Start Redis locally with: redis-server');
        console.log('[REDIS] TIP: Or use Docker: docker run -d -p 6379:6379 redis:latest');
        console.log('[REDIS] TIP: Or set USE_CLOUD_REDIS=true for cloud Redis');
    }
});
exports.redisConnection.on('close', () => {
    console.log('[REDIS] Connection closed');
});
// Graceful shutdown
process.on('SIGINT', async () => {
    await exports.redisConnection.quit();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await exports.redisConnection.quit();
    process.exit(0);
});
exports.default = exports.redisConnection;
