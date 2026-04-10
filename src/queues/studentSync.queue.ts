import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Create BullMQ queue for student sync jobs
export const studentSyncQueue = new Queue('student-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 1000,         // Start with 1 second delay
    },
  },
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await studentSyncQueue.close();
  console.log('[QUEUE] Student sync queue closed');
});

process.on('SIGTERM', async () => {
  await studentSyncQueue.close();
  console.log('[QUEUE] Student sync queue closed');
});

export default studentSyncQueue;
