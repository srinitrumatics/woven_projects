import { pool } from '@/db';
import algoliasearch from 'algoliasearch';
import { getProductDetailsFromSalesforce } from './product-salesforce-service';

/**
 * Syncs a newly created or updated Salesforce product to PostgreSQL and Algolia immediately.
 */
export async function syncNewProductToPostgresAndAlgolia(
  sfProductId: string,
  initialProductData: any,
  accountId: string,
  contactId?: string
): Promise<void> {
  let productData = initialProductData;

  // ── Step 0: Fetch latest data from Salesforce ──────────────────────────────
  // If we have a contactId, we can fetch the full record from Salesforce to ensure
  // we have all fields (like CreatedDate, proper picklist values, etc.)
  if (contactId) {
    try {
      console.log(`[ProductSync] 🔍 Fetching latest data from Salesforce for ${sfProductId}...`);
      const sfResult = await getProductDetailsFromSalesforce(accountId, contactId, sfProductId, 'product');

      if (sfResult && (sfResult.success || sfResult.Id || sfResult.product)) {
        // Handle various response structures (data, product array, or direct object)
        const fetchedData = 
          (Array.isArray(sfResult.data) ? sfResult.data[0] : sfResult.data) ||
          (Array.isArray(sfResult.product) ? sfResult.product[0] : sfResult.product) ||
          (sfResult.Id ? sfResult : null);

        if (fetchedData) {
          // Merge fetched data over initial data to ensure we have full record
          productData = { ...productData, ...fetchedData };
          console.log(`[ProductSync] 📥 Successfully fetched latest data from Salesforce for ${sfProductId}`);
        }
      }
    } catch (fetchErr: any) {
      console.warn(`[ProductSync] ⚠️ Could not fetch latest data from Salesforce, falling back to initial payload:`, fetchErr.message);
    }
  }

  // ── Step 1: Upsert into salesforce.product2 ────────────────────────────────
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
        gtherp__category__c,
        gtherp__sub_category__c,
        createddate,
        systemmodstamp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, NOW()), NOW()
      )
      ON CONFLICT (sfid) DO UPDATE SET
        name                         = EXCLUDED.name,
        productcode                  = EXCLUDED.productcode,
        isactive                     = EXCLUDED.isactive,
        family                       = EXCLUDED.family,
        description                  = EXCLUDED.description,
        manufacturer_name__c         = EXCLUDED.manufacturer_name__c,
        gtherp__price__c             = EXCLUDED.gtherp__price__c,
        gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
        product_availability__c      = EXCLUDED.product_availability__c,
        gtherp__category__c          = EXCLUDED.gtherp__category__c,
        gtherp__sub_category__c       = EXCLUDED.gtherp__sub_category__c,
        systemmodstamp               = NOW()
      `,
      [
        sfProductId,                                    // $1 sfid
        productData.Name ?? productData.name ?? '',      // $2 name
        productData.ProductCode ?? productData.productcode ?? null, // $3 productcode
        productData.IsActive === false ? false : true,  // $4 isactive (default true)
        productData.Family ?? productData.family ?? null, // $5 family
        productData.Description ?? productData.description ?? null, // $6 description
        accountId,                                      // $7 manufacturer_name__c
        productData.UnitPrice ?? productData.UnitPrice__c ?? 0, // $8 gtherp__price__c
        productData.Available_To_Sell__c ?? 0,          // $9 gtherp__available_quantity__c
        productData.Product_Availability__c ?? productData.gtherp__Product_Availability__c ?? productData.product_availability__c ?? null, // $10 product_availability__c
        productData.gtherp__category__c ?? productData.Category__c ?? null, // $11 gtherp__category__c
        productData.gtherp__sub_category__c ?? productData.Sub_Category__c ?? null, // $12 gtherp__sub_category__c
        productData.CreatedDate ?? null,                // $13 createddate
      ]
    );

    console.log(`[ProductSync] 🔵 DATA UPSERTED INTO POSTGRES: sfid: ${sfProductId}`);
  } catch (pgErr: any) {
    console.error(`[ProductSync] ❌ PostgreSQL upsert failed for ${sfProductId}:`, pgErr.message);
  }

  // ── Step 2: Push directly to Algolia ──────────────────────────────────────
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_woven_products';

    if (!appId || !adminKey) {
      console.warn('[ProductSync] ⚠️ Algolia credentials missing. Skipping direct push.');
      return;
    }

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    await index.saveObject({
      objectID: sfProductId,
      name: productData.Name ?? productData.name ?? '',
      sku: productData.StockKeepingUnit ?? productData.ProductCode ?? productData.productcode ?? '',
      description: productData.Description ?? productData.description ?? '',
      price: productData.UnitPrice ?? productData.UnitPrice__c ?? 0,
      stock_quantity: 0,
      available_quantity: productData.Available_To_Sell__c ?? 0,
      discount: 0,
      image_url: productData.image_url ?? null,
      images: productData.images ?? [],
      category: productData.gtherp__category__c ?? productData.Category__c ?? null,
      sub_category: productData.gtherp__sub_category__c ?? productData.Sub_Category__c ?? null,
      family: productData.Product_Family__c ?? productData.product_family__c ?? productData.Family ?? productData.family ?? '',
      manufacturer: accountId,
      status: productData.IsActive === false ? 'inactive' : 'active',
      is_active: productData.IsActive === false ? false : true,
      product_availability: productData.Product_Availability__c ?? productData.gtherp__Product_Availability__c ?? productData.product_availability__c ?? '',
      _tags: [
        productData.Product_Family__c,
        productData.product_family__c,
        productData.Family, 
        productData.family,
        productData.Category__c,
        productData.gtherp__category__c,
        productData.Sub_Category__c,
        productData.gtherp__sub_category__c,
        accountId,
        productData.Product_Availability__c ?? productData.product_availability__c
      ].filter(Boolean),
    });

    console.log(`[ProductSync] ✅ Algolia direct push succeeded for ${sfProductId}`);
  } catch (algoliaErr: any) {
    console.error(`[ProductSync] ❌ Algolia push failed for ${sfProductId}:`, algoliaErr.message);
  }
}
