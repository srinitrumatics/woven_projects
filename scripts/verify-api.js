
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
// Assuming Node 18+ for global fetch. If older, user needs to install node-fetch.
const fetch = global.fetch || require('node-fetch');

async function runVerification() {
    console.log('Starting verification...');

    // 1. Setup DB Connection
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();

    try {
        // 2. Generate and Insert Test API Key
        const testKey = 'sk_test_' + crypto.randomBytes(16).toString('hex');
        const keyHash = crypto.createHash('sha256').update(testKey).digest('hex');

        console.log(`Generated Test Key: ${testKey}`);

        await client.query(`
            INSERT INTO api_keys (id, key_hash, prefix, name, is_active, rate_limit)
            VALUES (gen_random_uuid(), $1, $2, 'Test Key', true, 100)
            ON CONFLICT (key_hash) DO NOTHING
        `, [keyHash, 'sk_test_']);

        console.log('Test key inserted into DB.');

        // 3. Test Endpoints
        const API_URL = 'http://localhost:3000/api/external/v1/products';
        const headers = {
            'x-api-key': testKey,
            'Content-Type': 'application/json'
        };

        // TEST 1: LIST
        console.log('\nTesting GET List...');
        const listRes = await fetch(API_URL, { headers });
        console.log(`List Status: ${listRes.status}`);
        if (listRes.status !== 200) throw new Error('Failed to list products');

        // TEST 2: CREATE
        console.log('\nTesting POST Create...');
        const newProductCode = `TEST_${Date.now()}`;
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Test Product',
                productCode: newProductCode,
                description: 'Created via verification script',
                isActive: true,
                price: "99.99"
            })
        });
        console.log(`Create Status: ${createRes.status}`);
        const createdData = await createRes.json();
        console.log('Created Product ID:', createdData.data?.sfid);

        if (!createdData.data?.sfid) throw new Error('Failed to create product');
        const productId = createdData.data.sfid;

        // TEST 3: GET ONE
        console.log('\nTesting GET One...');
        const getRes = await fetch(`${API_URL}/${productId}`, { headers });
        console.log(`Get One Status: ${getRes.status}`);
        if (getRes.status !== 200) throw new Error('Failed to get created product');

        // TEST 4: UPDATE
        console.log('\nTesting PUT Update...');
        const updateRes = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                name: 'Test Product Updated',
                productCode: newProductCode,
                isActive: false
            })
        });
        console.log(`Update Status: ${updateRes.status}`);
        const updatedData = await updateRes.json();
        if (updatedData.data?.name !== 'Test Product Updated') throw new Error('Update validation failed');

        // TEST 5: DELETE
        console.log('\nTesting DELETE...');
        const deleteRes = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE',
            headers
        });
        console.log(`Delete Status: ${deleteRes.status}`);
        if (deleteRes.status !== 200) throw new Error('Failed to delete product');

        console.log('\nVerification Successful! All endpoints are working.');

    } catch (error) {
        console.error('\nVerification Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Check for node-fetch or use global fetch (Node 18+)
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.warn('node-fetch not found, using global fetch if available');
    }
}

runVerification();
