
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
        console.log('Fixing API Key...');
        console.log(`Target Key: ${TARGET_KEY.substring(0, 30)}...`);

        // 1. Calculate Hash
        const keyHash = crypto.createHash('sha256').update(TARGET_KEY).digest('hex');
        console.log(`Key Hash:   ${keyHash}`);

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

        console.log('✅ Key inserted/updated successfully!');
        console.log(`Record ID: ${res.rows[0].id}`);
        console.log('\nYou can now use this key in your headers:');
        console.log(`x-api-key: ${TARGET_KEY}`);

    } catch (error) {
        console.error('Error fixing key:', error);
    } finally {
        await pool.end();
    }
}

fixKey();
