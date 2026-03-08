-- Script to update existing StudentProgress dates to create consecutive streak
-- Replace STUDENT_ID with actual student ID

-- Update existing entries to have consecutive dates
UPDATE "StudentProgress" 
SET sync_at = CURRENT_DATE - INTERVAL '1 day'
WHERE student_id = STUDENT_ID AND id = ENTRY_ID_1;

UPDATE "StudentProgress" 
SET sync_at = CURRENT_DATE - INTERVAL '2 days'
WHERE student_id = STUDENT_ID AND id = ENTRY_ID_2;

UPDATE "StudentProgress" 
SET sync_at = CURRENT_DATE - INTERVAL '3 days'
WHERE student_id = STUDENT_ID AND id = ENTRY_ID_3;

-- Add today's entry if not exists
INSERT INTO "StudentProgress" (student_id, question_id, sync_at)
SELECT STUDENT_ID, MIN(id), CURRENT_DATE
FROM "Question" 
WHERE id NOT IN (
    SELECT question_id FROM "StudentProgress" WHERE student_id = STUDENT_ID
)
LIMIT 1;
