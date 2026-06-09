
import { Pool } from 'pg';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const fetch = global.fetch || require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/external/v1';

export class ProductApiTest {
    private pool: Pool;
    private apiKey: string;
    private keyHash: string;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        this.apiKey = '';
        this.keyHash = '';
    }

    private async setup() {
        // Generate a random key
        const rawKey = 'sk_test_cls_' + crypto.randomBytes(16).toString('hex');
        this.apiKey = rawKey;
        this.keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

        // Insert into DB
        await this.pool.query(`
            INSERT INTO api_keys (key_hash, prefix, name, is_active, rate_limit)
            VALUES ($1, $2, 'Test Class Key', true, 100)
            ON CONFLICT (key_hash) DO NOTHING
        `, [this.keyHash, 'sk_test_cls_']);
    }

    private async cleanup() {
        if (this.keyHash) {
            await this.pool.query(`
                DELETE FROM api_keys WHERE key_hash = $1
            `, [this.keyHash]);
        }
        await this.pool.end();
    }

    public async testGetProducts() {
        try {
            await this.setup();

            const url = `${BASE_URL}/products?limit=5`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                console.error('FAILED: Expected 200 OK');
                const text = await response.text();
                console.error('Body:', text);
                return;
            }

            const data = await response.json();

            if (Array.isArray(data.data)) {
                if (data.data.length > 0) {} else {
                    console.warn('WARNING: No products found in DB/Salesforce table.');
                }
            } else {
                console.error('FAILED: Data is not an array.');
            }
        } catch (error) {
            console.error('Test Exception:', error);
        } finally {
            //await this.cleanup();
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const tester = new ProductApiTest();
    tester.testGetProducts();
}
