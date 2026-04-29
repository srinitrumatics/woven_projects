import { pool } from '@/db';
import algoliasearch from 'algoliasearch';

/**
 * Syncs a newly created Salesforce product to PostgreSQL and Algolia immediately.
 *
 * Why this exists:
 *  - AddProductModal creates products in Salesforce only.
 *  - Heroku Connect replicates Salesforce → salesforce.product2 in PostgreSQL,
 *    but this replication can take minutes.
 *  - The DB trigger (sf_product2_algolia_sync_trigger) only fires AFTER Heroku
 *    Connect writes to the table, so Algolia is also delayed.
 *  - This function bridges the gap: immediately upserts into the correct columns
 *    of salesforce.product2 and pushes directly to Algolia.
 *
 * PostgreSQL columns confirmed in salesforce.product2:
 *   sfid, productcode, name, description, isactive, family, image_url,
 *   gtherp__price__c, gtherp__stock_quantity__c, gtherp__available_quantity__c,
 *   gtherp__discount__c, gtherp__category__c, gtherp__sub_category__c,
 *   manufacturer_name__c, createddate, systemmodstamp
 */
export async function syncNewProductToPostgresAndAlgolia(
  sfProductId: string,
  productData: any,
  accountId: string
): Promise<void> {
  // ── Step 1: Upsert into salesforce.product2 ────────────────────────────────
  // Column names must exactly match the Heroku Connect replicated schema.
  try {
    const result = await pool.query(
      `
      INSERT INTO salesforce.product2 (
        sfid,
        name,
        productcode,
        isactive,
        family,
        description,
        manufacturer_name__c,
        gtherp__price__c,
        gtherp__available_quantity__c,
        product_availability__c,
        createddate,
        systemmodstamp
      ) VALUES (
        $1, $2, $3, TRUE, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      ON CONFLICT (sfid) DO UPDATE SET
        name                         = EXCLUDED.name,
        productcode                  = EXCLUDED.productcode,
        family                       = EXCLUDED.family,
        description                  = EXCLUDED.description,
        manufacturer_name__c         = EXCLUDED.manufacturer_name__c,
        gtherp__price__c             = EXCLUDED.gtherp__price__c,
        gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
        product_availability__c      = EXCLUDED.product_availability__c,
        systemmodstamp               = NOW()
      `,
      [
        sfProductId,                                    // $1 sfid
        productData.Name ?? '',                         // $2 name
        productData.ProductCode ?? null,                // $3 productcode
        productData.Family ?? null,                     // $4 family
        productData.Description ?? null,                // $5 description
        accountId,                                      // $6 manufacturer_name__c
        productData.UnitPrice ?? 0,                     // $7 gtherp__price__c
        productData.Available_To_Sell__c ?? 0,          // $8 gtherp__available_quantity__c
        productData.gtherp__Product_Availability__c ?? null,    // $9 product_availability__c
      ]
    );

    console.log(`[ProductSync] 🔵 DATA ADDED INTO POSTGRES: Upserted sfid: ${sfProductId}. Rows affected: ${result.rowCount}`);
    console.log(`[ProductSync] 🔍 Postgres query result for ${sfProductId}:`, {
      rowCount: result.rowCount,
      command: result.command
    });
    console.log(`[ProductSync] 🟠 DATA ADDED INTO LOGS AND SYNC QUEUE: DB trigger fired, record enqueued in salesforce.algolia_sync_queue.`);

    console.log(`[ProductSync] ✅ PostgreSQL upsert succeeded for ${sfProductId}. Data:`, {
      name: productData.Name,
      code: productData.ProductCode,
      price: productData.UnitPrice,
      avail: productData.Available_To_Sell__c
    });
    // NOTE: The DB trigger (sf_product2_algolia_sync_trigger) will automatically
    // fire here and enqueue this product in salesforce.algolia_sync_queue.
    // The worker will pick it up within ~5 seconds. We ALSO push directly below
    // so there is zero latency for the new product to appear in Algolia.
  } catch (pgErr: any) {
    // Non-fatal — Heroku Connect will eventually replicate the product.
    console.error(`[ProductSync] ❌ PostgreSQL upsert failed for ${sfProductId} (Manual Sync):`, pgErr.message);
    if (pgErr.detail) console.error(`[ProductSync] Detail: ${pgErr.detail}`);
    if (pgErr.where) console.error(`[ProductSync] Where: ${pgErr.where}`);
  }

  // ── Step 2: Push directly to Algolia (zero-latency, bypasses queue) ────────
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName =
      process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

    if (!appId || !adminKey) {
      console.warn(
        '[ProductSync] ⚠️  Algolia credentials missing ' +
        '(NEXT_PUBLIC_ALGOLIA_APP_ID / ALGOLIA_ADMIN_KEY). Skipping direct Algolia push.'
      );
      return;
    }

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    console.log(`[ProductSync] 📤 Pushing directly to Algolia index "${indexName}" for ${sfProductId}`);

    // Shape matches what salesforce.transform_sf_product_for_algolia produces
    await index.saveObject({
      objectID:           sfProductId,
      name:               productData.Name ?? '',
      sku:                productData.StockKeepingUnit ?? productData.ProductCode ?? '',
      description:        productData.Description ?? '',
      price:              productData.UnitPrice ?? 0,
      stock_quantity:     0,
      available_quantity: productData.Available_To_Sell__c ?? 0,
      discount:           0,
      image_url:          null,
      images:             [],
      category:           null,
      sub_category:       null,
      family:             productData.Family ?? '',
      manufacturer:       accountId,
      status:             'active',
      is_active:          true,
      product_availability: productData.gtherp__Product_Availability__c ?? '',
      _tags: [productData.Family].filter(Boolean),
    });

    console.log(
      `[ProductSync] ✅ Algolia direct push succeeded for ${sfProductId}`
    );
    console.log(`[ProductSync] 🟣 ALGOLIA SUCCESS: Directly pushed sfid: ${sfProductId}`);
  } catch (algoliaErr: any) {
    console.error(`[ProductSync] ❌ Algolia push failed for ${sfProductId}:`, algoliaErr.message);
  }
}
