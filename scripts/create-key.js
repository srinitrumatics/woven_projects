
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createKey() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const name = process.argv[2] || 'New API Key';
        const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
        const prefix = 'sk_live_';

        console.log(`Creating API Key: "${name}"...`);

        const res = await pool.query(`
            INSERT INTO api_keys (key_hash, prefix, name, is_active, rate_limit)
            VALUES ($1, $2, $3, true, 60)
            RETURNING id, created_at
        `, [keyHash, prefix, name]);

        console.log('\n✅ API Key Created Successfully!');
        console.log('------------------------------------------------');
        console.log(`Name:       ${name}`);
        console.log(`ID:         ${res.rows[0].id}`);
        console.log(`Rate Limit: 60 req/min`);
        console.log(`Created:    ${res.rows[0].created_at}`);
        console.log('------------------------------------------------');
        console.log(`🔑 KEY:     ${rawKey}`);
        console.log('------------------------------------------------');
        console.log('⚠️  Store this key safely. It cannot be retrieved again.');

    } catch (error) {
        console.error('Error creating key:', error);
    } finally {
        await pool.end();
    }
}

createKey();
