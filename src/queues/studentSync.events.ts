import { QueueEvents } from "bullmq";
import { redisConnection } from "../config/redis";
import { completeSync } from "../utils/syncStatus";
import { clearBatchQuestions } from "../store/batchQuestions.store";

// Initialize QueueEvents for completion detection
export const studentSyncQueueEvents = new QueueEvents("student-sync", {
  connection: redisConnection,
});

// Handle queue drained event (all jobs completed)
studentSyncQueueEvents.on("drained", async () => {
  console.log("[SYNC] All jobs completed");
  
  // Mark sync as completed
  completeSync();
  
  // Clear batch questions from memory
  clearBatchQuestions();
  
  console.log("[SYNC] Sync cycle completed and memory cleared");
});

// Handle job completion for detailed logging
studentSyncQueueEvents.on("completed", (job) => {
  console.log(`[SYNC] Job ${job.jobId} completed`);
});

// Handle job failures
studentSyncQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`[SYNC] Job ${jobId} failed: ${failedReason}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await studentSyncQueueEvents.close();
  console.log("[SYNC] Queue events closed");
});

process.on("SIGTERM", async () => {
  await studentSyncQueueEvents.close();
  console.log("[SYNC] Queue events closed");
});

export default studentSyncQueueEvents;
