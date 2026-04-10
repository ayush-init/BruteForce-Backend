"use strict";
// In-memory store for batch questions to optimize sync performance
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBatchQuestions = setBatchQuestions;
exports.getBatchQuestions = getBatchQuestions;
exports.getAllBatchQuestions = getAllBatchQuestions;
exports.clearBatchQuestions = clearBatchQuestions;
// In-memory Map to store batch questions
const batchQuestionsStore = new Map();
/**
 * Store batch questions data in memory
 */
function setBatchQuestions(batchData) {
    // Clear existing data
    batchQuestionsStore.clear();
    // Add new batch data
    for (const [batchId, data] of batchData.entries()) {
        batchQuestionsStore.set(batchId, data);
    }
    console.log(`[BATCH_STORE] Loaded batch questions for ${batchData.size} batches`);
}
/**
 * Get batch questions data by batch ID
 */
function getBatchQuestions(batchId) {
    return batchQuestionsStore.get(batchId);
}
/**
 * Get all batch questions data (for debugging)
 */
function getAllBatchQuestions() {
    return new Map(batchQuestionsStore);
}
/**
 * Clear batch questions store
 */
function clearBatchQuestions() {
    batchQuestionsStore.clear();
    console.log('[BATCH_STORE] Cleared batch questions store');
}
