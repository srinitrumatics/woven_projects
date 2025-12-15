
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

        console.log('--- Current API Keys in DB ---');
        const res = await client.query('SELECT id, name, prefix, key_hash, is_active FROM api_keys');
        res.rows.forEach(row => {
            console.log(`ID: ${row.id} | Name: ${row.name} | Prefix: ${row.prefix} | Active: ${row.is_active}`);
            console.log(`Stored Hash: ${row.key_hash}`);
            console.log('-----------------------------------');
        });

        // Check if the specific key reported by user is stored as raw text in the hash column
        const problematicKey = 'sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd';

        console.log('\n--- Diagnosis ---');
        const exactMatch = res.rows.find(r => r.key_hash === problematicKey);
        if (exactMatch) {
            console.log('❌ ISSUE DETECTED: The raw key is stored directly in the "key_hash" column.');
            console.log('The "key_hash" column should contain the SHA-256 hash of the key, not the key itself.');

            // Calculate what the hash SHOULD be
            const correctHash = crypto.createHash('sha256').update(problematicKey).digest('hex');
            console.log(`\nInput Key:   ${problematicKey}`);
            console.log(`Correct Hash: ${correctHash}`);
            console.log('\nTo fix this, update the record with the hashed value.');
        } else {
            const hashOfInput = crypto.createHash('sha256').update(problematicKey).digest('hex');
            const hashMatch = res.rows.find(r => r.key_hash === hashOfInput);

            if (hashMatch) {
                console.log('✅ The key appears to be correctly hashed in the database.');
                if (!hashMatch.is_active) {
                    console.log('⚠️ But the key is INACTIVE.');
                }
            } else {
                console.log('❌ The provided key matches no record in the database (neither raw nor hashed).');
            }
        }

        client.release();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

debugKeys();
