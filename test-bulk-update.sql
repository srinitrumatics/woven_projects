-- Test bulk update behavior
-- Run this to see if bulk updates are triggering properly

-- First, check current queue state
SELECT 'Before bulk update - Queue state:' as step;
SELECT status, COUNT(*) as count 
FROM salesforce.algolia_sync_queue 
GROUP BY status;

-- Check a sample of product2 records
SELECT 'Sample product2 records:' as step;
SELECT sfid, name, image_url 
FROM salesforce.product2 
LIMIT 5;

-- Now let's test with a small bulk update
-- Update 3 records at once
SELECT 'Performing bulk update on 3 records...' as step;

UPDATE salesforce.product2 
SET image_url = jsonb_set(
    COALESCE(image_url, '{}'::jsonb), 
    '{test_field}', 
    to_jsonb(NOW()::text)
)
WHERE sfid IN (
    SELECT sfid FROM salesforce.product2 LIMIT 3
);

-- Check queue after bulk update
SELECT 'After bulk update - Queue state:' as step;
SELECT status, COUNT(*) as count 
FROM salesforce.algolia_sync_queue 
GROUP BY status;

-- Check the actual queue entries
SELECT 'Recent queue entries:' as step;
SELECT id, table_name, record_id, operation, created_at, status
FROM salesforce.algolia_sync_queue
ORDER BY created_at DESC
LIMIT 10;
