-- ============================================
-- Migration Script: Add Missing Constraint
-- ============================================

-- First, check if the constraint already exists and add it if not
DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_pending_operation'
    ) THEN
        -- Add the constraint
        ALTER TABLE algolia_sync_queue
        ADD CONSTRAINT unique_pending_operation 
        UNIQUE (table_name, record_id, operation, status);
        
        RAISE NOTICE 'Constraint unique_pending_operation added successfully';
    ELSE
        RAISE NOTICE 'Constraint unique_pending_operation already exists';
    END IF;
END $$;
