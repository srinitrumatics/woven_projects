
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function debugKeys() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const res = await client.query('SELECT id, name, prefix, key_hash, is_active FROM api_keys');
        res.rows.forEach(row => {});

        // Check if the specific key reported by user is stored as raw text in the hash column
        const problematicKey = 'sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd';

        const exactMatch = res.rows.find(r => r.key_hash === problematicKey);
        if (exactMatch) {
            // Calculate what the hash SHOULD be
            const correctHash = crypto.createHash('sha256').update(problematicKey).digest('hex');
        } else {
            const hashOfInput = crypto.createHash('sha256').update(problematicKey).digest('hex');
            const hashMatch = res.rows.find(r => r.key_hash === hashOfInput);

            if (hashMatch) {
                if (!hashMatch.is_active) {}
            } else {}
        }

        client.release();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

debugKeys();
