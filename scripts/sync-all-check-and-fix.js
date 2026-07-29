/**
 * 1. For each project DB: add gtherp__moq__c, gtherp__available_to_sell__c, gtherp__brand_name__c
 *    to every product2 table in every schema (except data connector tables)
 *    and update the transform function.
 * 2. Push updated Algolia index settings (moq, available_to_sell, brand) to all indexes.
 */

const { Pool } = require('pg');
const path = require('path');

// ── Project configs ───────────────────────────────────────────────────────────
const PROJECTS = [
  {
    name: 'woven_projects-main (local)',
    dbUrl: 'postgres://postgres:password123@localhost:5432/wovn_web_db',
    ssl: false,
    algoliaAppId: 'O55ILFI20E',
    algoliaAdminKey: '78d65b440e2be8467141437a20be9db2',
  },
  {
    name: 'woven_projects-claude (local)',
    dbUrl: 'postgres://postgres:password123@localhost:5432/wovn_web_db',
    ssl: false,
    algoliaAppId: 'O55ILFI20E',
    algoliaAdminKey: '78d65b440e2be8467141437a20be9db2',
  },
  {
    name: 'ClientPartnerPortal-main',
    dbUrl: 'postgres://u7vcadvgd6h0bk:padf9c158cb89a74c49ebe79f0b04eaf8bca30e86ea13b2ec0f875abf37628117@c1jpc731rp0brl.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1efk8pbo0783p',
    ssl: true,
    algoliaAppId: 'O55ILFI20E',
    algoliaAdminKey: '78d65b440e2be8467141437a20be9db2',
  },
  {
    name: 'ClientPartnerPortal-prod',
    dbUrl: 'postgres://u1ejkdf3lhuk2:p25bac9c177dcc22eb1edd264a2c8b178cd736645cd4a8115db17b741565dc6c6@cet8r1hlj0mlnt.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d1tfc5mb7jo0do',
    ssl: true,
    algoliaAppId: 'O55ILFI20E',
    algoliaAdminKey: '78d65b440e2be8467141437a20be9db2',
    algoliaExtraIndexes: ['dev_woven_products'],
  },
];

// Algolia index settings to apply
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
    'name', 'description', 'sku', 'brand',
    'manufacturer', 'category', 'family', 'sub_category',
  ],
};

// ── DB helpers ────────────────────────────────────────────────────────────────
async function applyDBMigration(pool, projectName) {
  const client = await pool.connect();
  const results = [];
  try {
    // Find schemas with product2 (skip data_connector / public / pg schemas)
    const schemasRes = await client.query(`
      SELECT table_schema AS schema
        FROM information_schema.tables
       WHERE table_name = 'product2'
         AND table_schema NOT IN ('pg_catalog','information_schema','public','data_connector')
         AND table_schema NOT LIKE 'pg_%'
       ORDER BY table_schema
    `);
    const schemas = schemasRes.rows.map(r => r.schema);

    for (const schema of schemas) {
      const row = { schema, columns: '❌', transform: '❌', verified: [] };
      try {
        // Add columns
        await client.query(`
          ALTER TABLE "${schema}".product2
            ADD COLUMN IF NOT EXISTS gtherp__moq__c               NUMERIC,
            ADD COLUMN IF NOT EXISTS gtherp__available_to_sell__c  NUMERIC,
            ADD COLUMN IF NOT EXISTS gtherp__brand_name__c         VARCHAR(255)
        `);
        row.columns = '✅';

        // Update transform function if it exists
        const fnCheck = await client.query(`
          SELECT proname FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = $1 AND p.proname = 'transform_sf_product_for_algolia'
        `, [schema]);

        if (fnCheck.rows.length > 0) {
          await client.query(`
            CREATE OR REPLACE FUNCTION "${schema}".transform_sf_product_for_algolia(
              product_row "${schema}".product2
            ) RETURNS JSONB AS $func$
            BEGIN
              RETURN jsonb_strip_nulls(jsonb_build_object(
                'objectID',           product_row.sfid,
                'sku',                product_row.productcode,
                'name',               product_row.name,
                'description',        product_row.description,
                'price',              COALESCE(product_row.gtherp__price__c, 0),
                'listPrice',          COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
                'unitPrice',          COALESCE(product_row.gtherp__price__c, 0),
                'stock_quantity',     COALESCE(product_row.gtherp__stock_quantity__c, 0),
                'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
                'discount',           COALESCE(product_row.gtherp__discount__c, 0),
                'moq',                COALESCE(product_row.gtherp__moq__c, 0),
                'available_to_sell',  COALESCE(product_row.gtherp__available_to_sell__c, 0),
                'image_url', CASE
                  WHEN product_row.image_url IS NOT NULL
                    AND product_row.image_url->'images' IS NOT NULL
                    AND jsonb_array_length(product_row.image_url->'images') > 0
                    THEN product_row.image_url#>>'{images,0,url}'
                  ELSE NULL
                END,
                'images', CASE
                  WHEN product_row.image_url IS NOT NULL
                    AND product_row.image_url->'images' IS NOT NULL
                    THEN product_row.image_url->'images'
                  ELSE '[]'::jsonb
                END,
                'category',               product_row.gtherp__category__c,
                'sub_category',           product_row.gtherp__sub_category__c,
                'family',                 product_row.family,
                'manufacturer',           product_row.manufacturer_name__c,
                'brand',                  product_row.gtherp__brand_name__c,
                'status',                 CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
                'is_active',              product_row.isactive,
                'product_availability',   product_row.product_availability__c,
                'Availability_Status__c', product_row.product_availability__c,
                'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
                'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
                '_tags', ARRAY_REMOVE(ARRAY[
                  product_row.family,
                  product_row.gtherp__category__c,
                  product_row.gtherp__sub_category__c,
                  product_row.manufacturer_name__c,
                  product_row.gtherp__brand_name__c,
                  product_row.product_availability__c
                ], NULL)
              ));
            END;
            $func$ LANGUAGE plpgsql IMMUTABLE
          `);
          row.transform = '✅';
        } else {
          row.transform = '⚠️ (no fn)';
        }

        // Verify columns
        const colCheck = await client.query(`
          SELECT column_name
            FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = 'product2'
             AND column_name IN ('gtherp__moq__c','gtherp__available_to_sell__c','gtherp__brand_name__c')
           ORDER BY column_name
        `, [schema]);
        row.verified = colCheck.rows.map(r => r.column_name);

      } catch (err) {
        row.error = err.message.slice(0, 80);
      }
      results.push(row);
    }
  } finally {
    client.release();
  }
  return results;
}

// ── Algolia helpers ───────────────────────────────────────────────────────────
async function getAlgoliaIndexes(pool) {
  const client = await pool.connect();
  try {
    const schemasRes = await client.query(`
      SELECT table_schema FROM information_schema.tables
      WHERE table_name = 'algolia_index_config'
        AND table_schema NOT IN ('pg_catalog','information_schema','public','data_connector')
    `);
    const indexes = new Set();
    for (const { table_schema: schema } of schemasRes.rows) {
      try {
        const res = await client.query(
          `SELECT index_name FROM "${schema}".algolia_index_config WHERE is_enabled = true`
        );
        res.rows.forEach(r => indexes.add(r.index_name));
      } catch (_) {}
    }
    return [...indexes];
  } finally {
    client.release();
  }
}

async function pushAlgoliaSettings(appId, adminKey, indexName) {
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
  return json.taskID;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const processedIndexes = new Set(); // avoid double-pushing same index

  for (const project of PROJECTS) {
    console.log(`\n${'═'.repeat(55)}`);
    console.log(`🏗️  ${project.name}`);
    console.log('═'.repeat(55));

    const pool = new Pool({
      connectionString: project.dbUrl,
      ssl: project.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });

    // ── 1. DB migration ──────────────────────────────────────────────────────
    console.log('\n  📊 DB Migration:');
    try {
      const rows = await applyDBMigration(pool, project.name);
      if (rows.length === 0) {
        console.log('    ⚠️  No product2 schemas found');
      }
      for (const r of rows) {
        const verified = r.verified.length === 3 ? '✅ all 3 cols verified' : `⚠️ ${r.verified.join(',')}`;
        console.log(`    Schema: ${r.schema}`);
        console.log(`      Columns: ${r.columns}  Transform: ${r.transform}  ${verified}`);
        if (r.error) console.log(`      ❌ Error: ${r.error}`);
      }
    } catch (err) {
      console.log(`    ❌ DB Error: ${err.message.slice(0, 120)}`);
    }

    // ── 2. Algolia indexes ───────────────────────────────────────────────────
    console.log('\n  📡 Algolia Index Settings:');
    const indexSet = new Set(project.algoliaExtraIndexes || []);
    try {
      const dbIndexes = await getAlgoliaIndexes(pool);
      dbIndexes.forEach(i => indexSet.add(i));
    } catch (_) {}
    // fallback
    if (indexSet.size === 0) indexSet.add('wovn_products_local');

    for (const indexName of indexSet) {
      const key = `${project.algoliaAppId}::${indexName}`;
      const already = processedIndexes.has(key);
      process.stdout.write(`    ⏳ ${indexName}${already ? ' (already pushed)' : ''} ... `);
      if (already) { console.log('⏭️ skipped'); continue; }
      try {
        const taskId = await pushAlgoliaSettings(project.algoliaAppId, project.algoliaAdminKey, indexName);
        console.log(`✅ taskID=${taskId}`);
        processedIndexes.add(key);
      } catch (err) {
        console.log(`❌ ${err.message.slice(0, 80)}`);
      }
    }

    await pool.end();
  }

  console.log(`\n${'═'.repeat(55)}`);
  console.log('🎉 All projects processed!\n');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
