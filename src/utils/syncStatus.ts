interface SyncStatus {
  isRunning: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
}

// In-memory sync status tracking
let syncStatus: SyncStatus = {
  isRunning: false,
  startedAt: null,
  completedAt: null,
};

// Get current sync status
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

// Start sync process
export function startSync(): void {
  syncStatus.isRunning = true;
  syncStatus.startedAt = new Date();
  syncStatus.completedAt = null;
  console.log('[SYNC_STATUS] Sync started at:', syncStatus.startedAt.toISOString());
}

// Complete sync process
export function completeSync(): void {
  syncStatus.isRunning = false;
  syncStatus.completedAt = new Date();
  console.log('[SYNC_STATUS] Sync completed at:', syncStatus.completedAt.toISOString());
}

// Reset sync status (for error cases)
export function resetSync(): void {
  syncStatus.isRunning = false;
  syncStatus.startedAt = null;
  syncStatus.completedAt = null;
  console.log('[SYNC_STATUS] Sync status reset');
}

// Check if sync is currently running
export function isSyncRunning(): boolean {
  return syncStatus.isRunning;
}

// Get sync completion time
export function getSyncCompletionTime(): Date | null {
  return syncStatus.completedAt;
}
