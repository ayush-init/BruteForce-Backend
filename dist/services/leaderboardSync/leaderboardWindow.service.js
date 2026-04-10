"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryRunLeaderboard = tryRunLeaderboard;
const sync_core_service_1 = require("./sync-core.service");
const syncStatus_1 = require("../../utils/syncStatus");
// Leaderboard window logic with sync status awareness
async function tryRunLeaderboard() {
    const MAX_WAIT = 20 * 60 * 1000; // 20 minutes in milliseconds
    const INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds
    let waited = 0;
    console.log('[LEADERBOARD] Starting leaderboard sync with window logic');
    while (waited < MAX_WAIT) {
        // Check if sync is not running AND has completed at least once
        if (!(0, syncStatus_1.isSyncRunning)() && (0, syncStatus_1.getSyncCompletionTime)() !== null) {
            try {
                console.log('[LEADERBOARD] Sync is complete, running leaderboard update');
                const result = await (0, sync_core_service_1.syncLeaderboardData)();
                console.log(`[LEADERBOARD] Leaderboard sync completed successfully. Processed ${result.studentsProcessed} students`);
                return;
            }
            catch (error) {
                console.error('[LEADERBOARD] Leaderboard sync failed:', error);
                throw error;
            }
        }
        else {
            console.log(`[LEADERBOARD] Sync still running or not completed. Waiting ${INTERVAL / 1000} seconds... (${waited / 1000}s elapsed)`);
            await new Promise(resolve => setTimeout(resolve, INTERVAL));
            waited += INTERVAL;
        }
    }
    // If we reach here, we've waited the maximum time
    console.log('[LEADERBOARD] Max wait time reached, skipping leaderboard cycle');
    console.log(`[LEADERBOARD] Sync status: isRunning=${(0, syncStatus_1.isSyncRunning)()}, completedAt=${(0, syncStatus_1.getSyncCompletionTime)()?.toISOString() || 'never'}`);
}
