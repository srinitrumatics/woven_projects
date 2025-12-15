
-- Insert a new API Key
-- NOTE: You must generate the SHA-256 hash of your key manually if running this directly.
-- Suggested Node.js one-liner to generate hash:
-- node -e "const k='sk_live_'+require('crypto').randomBytes(16).toString('hex'); console.log('Key:', k); console.log('Hash:', require('crypto').createHash('sha256').update(k).digest('hex'))"

INSERT INTO api_keys (
    key_hash, 
    prefix, 
    name, 
    is_active, 
    rate_limit
)
VALUES (
    'sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd', -- Replace with the actual hash
    'sk_live_',              -- Prefix for identification
    'Manual Key',            -- Name of the key
    true,                    -- is_active
    100                      -- rate_limit (requests per minute)
);
