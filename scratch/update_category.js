const { Pool } = require('pg');
const algoliasearch = require('algoliasearch');
require('dotenv').config();

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  const sql = `
CREATE OR REPLACE FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2)
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_strip_nulls(jsonb_build_object(
        'objectID', product_row.sfid,
        'sku', product_row.productcode,
        'name', product_row.name,
        'description', product_row.description,
        'price', COALESCE(product_row.gtherp__price__c, 0),
        'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
        'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
        'discount', COALESCE(product_row.gtherp__discount__c, 0),
        
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
        
        'category', COALESCE(NULLIF(product_row.gtherp__category__c, ''), product_row.family, 'No Category'),
        'sub_category', product_row.gtherp__sub_category__c,
        'family', product_row.family,
        'manufacturer', product_row.manufacturer_name__c,
        
        'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
        'is_active', product_row.isactive,
        
        'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
        'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
        
        '_tags', ARRAY_REMOVE(ARRAY[
            product_row.family, 
            product_row.gtherp__category__c, 
            product_row.gtherp__sub_category__c,
            product_row.manufacturer_name__c
        ], NULL)
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
  `;

  await pool.query(sql);
  console.log("Updated PostgreSQL function");
  
  // Now update algolia
  const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local');
  
  let hits = [];
  await index.browseObjects({
    query: '',
    batch: batch => {
      hits = hits.concat(batch);
    }
  });
  
  const updatedHits = hits.map(hit => {
    let cat = hit.category;
    if (!cat || cat === '') {
       cat = hit.family || hit.productFamily || hit.manufacturer || 'No Category';
    }
    return {
      ...hit,
      category: cat
    };
  });
  
  await index.partialUpdateObjects(updatedHits, { createIfNotExists: true });
  console.log(`Updated ${updatedHits.length} objects in Algolia`);
  
  await pool.end();
}

run().catch(console.error);
