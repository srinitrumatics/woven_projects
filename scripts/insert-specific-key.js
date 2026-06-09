
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TARGET_KEY = 'sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd';

async function fixKey() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Calculate Hash
        const keyHash = crypto.createHash('sha256').update(TARGET_KEY).digest('hex');

        // 2. Insert or Update
        // modifying schema to be safe: key_hash is unique
        const query = `
            INSERT INTO api_keys (key_hash, prefix, name, is_active, rate_limit)
            VALUES ($1, $2, $3, true, 100)
            ON CONFLICT (key_hash) DO UPDATE 
            SET is_active = true, updated_at = CURRENT_TIMESTAMP
            RETURNING id;
        `;

        const res = await pool.query(query, [keyHash, 'sk_test_', 'Manual Test Key']);
    } catch (error) {
        console.error('Error fixing key:', error);
    } finally {
        await pool.end();
    }
}

fixKey();
