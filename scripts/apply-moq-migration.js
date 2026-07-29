/**
 * Applies the moq / available_to_sell / brand migration to every org schema
 * that has a product2 table in the live database.
 *
 * Usage:  node scripts/apply-moq-migration.js
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // 1. Find all schemas that have a product2 table
    const schemasRes = await client.query(`
      SELECT table_schema AS schema
        FROM information_schema.tables
       WHERE table_name = 'product2'
         AND table_schema NOT IN ('pg_catalog', 'information_schema')
       ORDER BY table_schema
    `);

    const schemas = schemasRes.rows.map(r => r.schema);
    console.log(`\n🔍 Found ${schemas.length} schema(s) with product2: ${schemas.join(', ')}\n`);

    for (const schema of schemas) {
      console.log(`\n──────────────────────────────────`);
      console.log(`📦 Schema: ${schema}`);

      try {
        // 2a. Add columns (IF NOT EXISTS — idempotent)
        await client.query(`
          ALTER TABLE "${schema}".product2
            ADD COLUMN IF NOT EXISTS gtherp__moq__c               NUMERIC,
            ADD COLUMN IF NOT EXISTS gtherp__available_to_sell__c  NUMERIC,
            ADD COLUMN IF NOT EXISTS gtherp__brand_name__c         VARCHAR(255)
        `);
        console.log(`  ✅ Columns added (gtherp__moq__c, gtherp__available_to_sell__c, gtherp__brand_name__c)`);

        // 2b. Check if the transform function exists and recreate it with new fields
        const fnCheck = await client.query(`
          SELECT proname FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = $1 AND p.proname = 'transform_sf_product_for_algolia'
        `, [schema]);

        if (fnCheck.rows.length > 0) {
          await client.query(`
            CREATE OR REPLACE FUNCTION "${schema}".transform_sf_product_for_algolia(
              product_row "${schema}".product2
            )
            RETURNS JSONB AS $func$
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
          console.log(`  ✅ transform_sf_product_for_algolia updated`);
        } else {
          console.log(`  ⚠️  No transform function found (schema may not use Algolia yet)`);
        }

        // 2c. Verify columns actually exist now
        const colCheck = await client.query(`
          SELECT column_name
            FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = 'product2'
             AND column_name IN ('gtherp__moq__c','gtherp__available_to_sell__c','gtherp__brand_name__c')
           ORDER BY column_name
        `, [schema]);
        const found = colCheck.rows.map(r => r.column_name);
        console.log(`  ✅ Verified columns present: ${found.join(', ')}`);

      } catch (err) {
        console.error(`  ❌ Error in schema "${schema}":`, err.message);
      }
    }

    console.log(`\n\n🎉 Migration complete for all schemas.\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
