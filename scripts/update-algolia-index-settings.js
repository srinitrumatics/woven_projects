/**
 * Pushes updated Algolia index settings (with moq, available_to_sell, brand)
 * to every index configured across all live org schemas.
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ALGOLIA_SETTINGS = {
  attributesForFaceting: [
    'searchable(category)',
    'searchable(manufacturer)',
    'searchable(brand)',
    'searchable(family)',
    'searchable(sub_category)',
    'product_availability',
    'filterOnly(stock_quantity)',
    'filterOnly(moq)',
    'filterOnly(available_to_sell)',
    'price',
  ],
  searchableAttributes: [
    'name',
    'description',
    'sku',
    'brand',
    'manufacturer',
    'category',
    'family',
    'sub_category',
  ],
};

async function getIndexNamesFromDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    // Find all schemas that have algolia_index_config
    const schemasRes = await client.query(`
      SELECT table_schema FROM information_schema.tables
      WHERE table_name = 'algolia_index_config'
        AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema
    `);
    const indexMap = {};
    for (const { table_schema: schema } of schemasRes.rows) {
      const res = await client.query(
        `SELECT index_name FROM "${schema}".algolia_index_config WHERE is_enabled = true LIMIT 5`
      );
      for (const row of res.rows) {
        indexMap[row.index_name] = indexMap[row.index_name] || [];
        indexMap[row.index_name].push(schema);
      }
    }
    return indexMap;
  } finally {
    client.release();
    await pool.end();
  }
}

async function updateAlgoliaIndex(appId, adminKey, indexName, schemas) {
  const url = `https://${appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(indexName)}/settings`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': adminKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ALGOLIA_SETTINGS),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function run() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const fallbackIndex = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

  if (!appId || !adminKey) {
    console.error('❌ Missing NEXT_PUBLIC_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env');
    process.exit(1);
  }

  console.log(`\n🔑 Algolia App ID: ${appId}`);
  console.log(`📋 Settings to push:`);
  console.log(JSON.stringify(ALGOLIA_SETTINGS, null, 2));

  // Get index names from DB
  let indexMap = {};
  try {
    indexMap = await getIndexNamesFromDB();
    console.log(`\n🗄️  Indexes found in DB:`, indexMap);
  } catch (e) {
    console.warn(`⚠️  Could not query DB for index names (${e.message}), using fallback: ${fallbackIndex}`);
    indexMap[fallbackIndex] = ['(fallback)'];
  }

  // Ensure fallback index is always included
  if (!indexMap[fallbackIndex]) {
    indexMap[fallbackIndex] = ['(env fallback)'];
  }

  const indexNames = Object.keys(indexMap);
  console.log(`\n🚀 Pushing settings to ${indexNames.length} index(es): ${indexNames.join(', ')}\n`);

  let allOk = true;
  for (const indexName of indexNames) {
    const schemas = indexMap[indexName];
    process.stdout.write(`  ⏳ ${indexName} (used by: ${schemas.join(', ')}) ... `);
    try {
      const result = await updateAlgoliaIndex(appId, adminKey, indexName, schemas);
      console.log(`✅  taskID=${result.taskID}`);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      allOk = false;
    }
  }

  console.log(`\n${allOk ? '🎉 All Algolia indexes updated successfully!' : '⚠️  Some indexes failed — check output above.'}\n`);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
