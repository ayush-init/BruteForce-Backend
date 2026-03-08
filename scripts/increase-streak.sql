-- Script to increase streak by adding consecutive StudentProgress entries
-- Replace STUDENT_ID with actual student ID and QUESTION_ID with available question IDs

-- Example: Add entries for last 5 days (adjust dates as needed)
INSERT INTO "StudentProgress" (student_id, question_id, sync_at) VALUES
    -- Today
    (STUDENT_ID, QUESTION_ID_1, CURRENT_DATE),
    -- Yesterday  
    (STUDENT_ID, QUESTION_ID_2, CURRENT_DATE - INTERVAL '1 day'),
    -- 2 days ago
    (STUDENT_ID, QUESTION_ID_3, CURRENT_DATE - INTERVAL '2 days'),
    -- 3 days ago
    (STUDENT_ID, QUESTION_ID_4, CURRENT_DATE - INTERVAL '3 days'),
    -- 4 days ago
    (STUDENT_ID, QUESTION_ID_5, CURRENT_DATE - INTERVAL '4 days');

-- Note: Make sure QUESTION_ID_X are valid question IDs from your Question table
-- Note: Each (student_id, question_id) combination must be unique
