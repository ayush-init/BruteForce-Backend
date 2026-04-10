"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncStatus = getSyncStatus;
exports.startSync = startSync;
exports.completeSync = completeSync;
exports.resetSync = resetSync;
exports.isSyncRunning = isSyncRunning;
exports.getSyncCompletionTime = getSyncCompletionTime;
// In-memory sync status tracking
let syncStatus = {
    isRunning: false,
    startedAt: null,
    completedAt: null,
};
// Get current sync status
function getSyncStatus() {
    return { ...syncStatus };
}
// Start sync process
function startSync() {
    syncStatus.isRunning = true;
    syncStatus.startedAt = new Date();
    syncStatus.completedAt = null;
    console.log('[SYNC_STATUS] Sync started at:', syncStatus.startedAt.toISOString());
}
// Complete sync process
function completeSync() {
    syncStatus.isRunning = false;
    syncStatus.completedAt = new Date();
    console.log('[SYNC_STATUS] Sync completed at:', syncStatus.completedAt.toISOString());
}
// Reset sync status (for error cases)
function resetSync() {
    syncStatus.isRunning = false;
    syncStatus.startedAt = null;
    syncStatus.completedAt = null;
    console.log('[SYNC_STATUS] Sync status reset');
}
// Check if sync is currently running
function isSyncRunning() {
    return syncStatus.isRunning;
}
// Get sync completion time
function getSyncCompletionTime() {
    return syncStatus.completedAt;
}
