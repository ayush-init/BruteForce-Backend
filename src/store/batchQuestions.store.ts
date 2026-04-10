// In-memory store for batch questions to optimize sync performance

interface BatchQuestionData {
  question_ids: number[];
  question_links: string[];
}

// In-memory Map to store batch questions
const batchQuestionsStore = new Map<number, BatchQuestionData>();

/**
 * Store batch questions data in memory
 */
export function setBatchQuestions(batchData: Map<number, BatchQuestionData>): void {
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
export function getBatchQuestions(batchId: number): BatchQuestionData | undefined {
  return batchQuestionsStore.get(batchId);
}

/**
 * Get all batch questions data (for debugging)
 */
export function getAllBatchQuestions(): Map<number, BatchQuestionData> {
  return new Map(batchQuestionsStore);
}

/**
 * Clear batch questions store
 */
export function clearBatchQuestions(): void {
  batchQuestionsStore.clear();
  console.log('[BATCH_STORE] Cleared batch questions store');
}
