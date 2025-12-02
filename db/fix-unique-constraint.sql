-- Migration script to fix the unique_pending_operation constraint
-- This changes it from a table constraint to a partial unique index
-- that only applies to pending operations

BEGIN;

-- Step 1: Drop the existing constraint
ALTER TABLE salesforce.algolia_sync_queue 
DROP CONSTRAINT IF EXISTS unique_pending_operation;

-- Step 2: Create a partial unique index that only applies to pending status
-- This prevents duplicate pending operations but allows multiple completed/failed records
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_operation 
ON salesforce.algolia_sync_queue(table_name, record_id, operation) 
WHERE status = 'pending';

COMMIT;

-- Verify the change
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'salesforce' 
AND tablename = 'algolia_sync_queue'
AND indexname = 'unique_pending_operation';
