import { pool } from '@/db';
import algoliasearch from 'algoliasearch';
import { getProductDetailsFromSalesforce } from './product-salesforce-service';
import { getOrgConfig } from './org-config';

/**
 * gtherp__Manufacturer_Name__c and gtherp__Brand_Name__c are Salesforce lookup
 * fields (to Account and a custom Brand object respectively), so the *__c key
 * itself is just a record ID — the readable name lives on the related record.
 * The Apex REST response flattens relationships inconsistently across
 * endpoints, so check every shape already seen in this codebase (bracket-key
 * dotted string, nested object, both with and without the gtherp__ namespace)
 * before falling back to the raw field name.
 */
function resolveLookupName(productData: any, fieldBase: string): string | null {
  return (
    productData[`gtherp__${fieldBase}__r.Name`] ??
    productData[`${fieldBase}__r.Name`] ??
    productData[`gtherp__${fieldBase}__r`]?.Name ??
    productData[`${fieldBase}__r`]?.Name ??
    null
  );
}

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

  const orgConfig = await getOrgConfig().catch(() => null);
  const dbSchemaName = (orgConfig?.algoliaSchema || 'salesforce').replace(/"/g, '');

  // ── Step 0: Fetch latest data from Salesforce ──────────────────────────────
  // If we have a contactId, we can fetch the full record from Salesforce to ensure
  // we have all fields (like CreatedDate, proper picklist values, etc.)
  if (contactId) {
    try {
      const sfResult = await getProductDetailsFromSalesforce(accountId, contactId, sfProductId, 'product');

      if (sfResult && (sfResult.success || sfResult.Id || sfResult.product)) {
        let fetchedData = null;
        if (sfResult.data) {
          const firstData = Array.isArray(sfResult.data) ? sfResult.data[0] : sfResult.data;
          if (firstData && firstData.Product && Array.isArray(firstData.Product) && firstData.Product.length > 0) {
            fetchedData = firstData.Product[0];
          } else {
            fetchedData = firstData;
          }
        } else if (sfResult.product) {
          fetchedData = Array.isArray(sfResult.product) ? sfResult.product[0] : sfResult.product;
        } else if (sfResult.Id) {
          fetchedData = sfResult;
        }

        if (fetchedData) {
          // We want the new edits (initialProductData) to take precedence over the old fetched data
          productData = { ...fetchedData, ...productData };
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
      INSERT INTO "${dbSchemaName}".product2 (
        sfid,
        name,
        productcode,
        isactive,
        family,
        description,
        manufacturer_name__c,
        gtherp__brand_name__c,
        gtherp__price__c,
        list_price__c,
        gtherp__available_quantity__c,
        product_availability__c,
        gtherp__category__c,
        gtherp__sub_category__c,
        gtherp__moq__c,
        gtherp__available_to_sell__c,
        createddate,
        systemmodstamp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, COALESCE($17, NOW()), NOW()
      )
      ON CONFLICT (sfid) DO UPDATE SET
        name                          = EXCLUDED.name,
        productcode                   = EXCLUDED.productcode,
        isactive                      = EXCLUDED.isactive,
        family                        = EXCLUDED.family,
        description                   = COALESCE(EXCLUDED.description, product2.description),
        manufacturer_name__c          = EXCLUDED.manufacturer_name__c,
        gtherp__brand_name__c         = EXCLUDED.gtherp__brand_name__c,
        gtherp__price__c              = EXCLUDED.gtherp__price__c,
        list_price__c                 = EXCLUDED.list_price__c,
        gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
        product_availability__c       = EXCLUDED.product_availability__c,
        gtherp__category__c           = EXCLUDED.gtherp__category__c,
        gtherp__sub_category__c       = EXCLUDED.gtherp__sub_category__c,
        gtherp__moq__c                = EXCLUDED.gtherp__moq__c,
        gtherp__available_to_sell__c  = EXCLUDED.gtherp__available_to_sell__c,
        systemmodstamp                = NOW()
      `,
      [
        sfProductId,                                                                          // $1  sfid
        productData.Name ?? productData.name ?? '',                                           // $2  name
        productData.ProductCode ?? productData.productcode ?? null,                           // $3  productcode
        productData.IsActive === false ? false : true,                                        // $4  isactive
        productData.Family ?? productData.family ?? null,                                     // $5  family
        productData.Description ?? productData.description ?? null,                           // $6  description
        resolveLookupName(productData, 'Manufacturer_Name') ?? productData.gtherp__Manufacturer_Name__c ?? productData.Manufacturer_Name__c ?? null, // $7  manufacturer_name__c
        // NULL (not '') is the canonical "no brand assigned" value — product-load-service.ts's
        // bulk sync follows this same convention so callers can tell "no brand" apart from
        // "not yet synced" (a product2 row that doesn't exist at all).
        resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ?? productData.Brand_Name__c ?? null,                       // $8  gtherp__brand_name__c
        productData.gtherp__price__c ?? productData.gtherp__Selling_Unit_Price__c ?? 0,      // $9  gtherp__price__c (selling price)
        productData.list_price__c ?? productData.List_Price__c ?? productData.UnitPrice ?? 0, // $10 list_price__c (list price)
        productData.gtherp__Available_To_Sell__c ?? productData.Available_To_Sell__c ?? 0,     // $11 gtherp__available_quantity__c
        productData.Product_Availability__c ?? productData.gtherp__Product_Availability__c ?? productData.product_availability__c ?? null, // $12
        productData.gtherp__category__c ?? productData.Category__c ?? productData.Family ?? productData.family ?? null, // $13
        productData.gtherp__sub_category__c ?? productData.Sub_Category__c ?? null,           // $14
        productData.gtherp__MOQ__c ?? productData.gtherp__moq__c ?? productData.MOQ__c ?? 0, // $15 gtherp__moq__c
        productData.gtherp__Available_To_Sell__c ?? productData.Available_To_Sell__c ?? 0,     // $16 gtherp__available_to_sell__c
        productData.CreatedDate ? new Date(productData.CreatedDate).toISOString() : null,     // $17 createddate
      ]

    );
  } catch (pgErr: any) {
    console.error(`[ProductSync] ❌ PostgreSQL upsert failed for ${sfProductId}:`, pgErr.message);
  }

  // ── Step 2: Push directly to Algolia ──────────────────────────────────────
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const indexName = orgConfig?.algoliaIndexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'wovn_products_local';

    if (!appId || !adminKey) {
      console.warn('[ProductSync] ⚠️ Algolia credentials missing. Skipping direct push.');
      return;
    }

    const client = algoliasearch(appId, adminKey);
    const index = client.initIndex(indexName);

    // Ensure required filter attributes are always set
    await index.setSettings({
      attributesForFaceting: [
        'searchable(category)',
        'searchable(manufacturer)',
        'product_availability',
        'filterOnly(stock_quantity)',
      ],
    }, { forwardToReplicas: true });

    await index.saveObject({
      objectID: sfProductId,
      name: productData.Name ?? productData.name ?? '',
      sku: productData.StockKeepingUnit ?? productData.ProductCode ?? productData.productcode ?? productData.sku ?? '',
      description: productData.Description ?? productData.description ?? productData.Description__c ?? '',
      list_price__c: productData.list_price__c ?? productData.List_Price__c ?? productData.UnitPrice ?? 0,
      price: productData.gtherp__price__c ?? productData.gtherp__Selling_Unit_Price__c ?? productData.UnitPrice__c ?? 0,
      listPrice: productData.list_price__c ?? productData.List_Price__c ?? productData.UnitPrice ?? productData.UnitPrice__c ?? 0,
      unitPrice: productData.gtherp__price__c ?? productData.gtherp__Selling_Unit_Price__c ?? productData.UnitPrice__c ?? 0,
      stock_quantity: 0,
      available_quantity: productData.gtherp__Available_To_Sell__c ?? productData.Available_To_Sell__c ?? 0,
      moq: productData.gtherp__MOQ__c ?? productData.gtherp__moq__c ?? productData.MOQ__c ?? 0,
      available_to_sell: productData.gtherp__Available_To_Sell__c ?? productData.Available_To_Sell__c ?? 0,
      discount: 0,
      image_url: productData.image_url ?? null,
      images: productData.images ?? [],
      category: productData.gtherp__category__c ?? productData.Category__c ?? productData.Family ?? productData.family ?? null,
      sub_category: productData.gtherp__sub_category__c ?? productData.Sub_Category__c ?? null,
      family: productData.Product_Family__c ?? productData.product_family__c ?? productData.Family ?? productData.family ?? '',
      manufacturer: resolveLookupName(productData, 'Manufacturer_Name') ?? productData.gtherp__Manufacturer_Name__c ?? productData.Manufacturer_Name__c ?? '',
      brand: resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ?? productData.Brand_Name__c ?? productData.Product_Brand_Name__c ?? '',
      status: productData.IsActive === false ? 'inactive' : 'active',
      is_active: productData.IsActive === false ? false : true,
      product_availability: productData.Product_Availability__c ?? productData.gtherp__Product_Availability__c ?? productData.product_availability__c ?? '',
      updated_at: Math.floor(Date.now() / 1000),
      created_at: productData.CreatedDate ? Math.floor(new Date(productData.CreatedDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
      _tags: [
        productData.Product_Family__c,
        productData.product_family__c,
        productData.Family,
        productData.family,
        productData.Category__c,
        productData.gtherp__category__c,
        productData.Sub_Category__c,
        productData.gtherp__sub_category__c,
        resolveLookupName(productData, 'Manufacturer_Name') ?? productData.gtherp__Manufacturer_Name__c ?? productData.Manufacturer_Name__c,
        resolveLookupName(productData, 'Brand_Name') ?? productData.gtherp__Brand_Name__c ?? productData.Brand_Name__c,
        productData.Product_Availability__c ?? productData.product_availability__c
      ].filter(Boolean),
    });
  } catch (algoliaErr: any) {
    console.error(`[ProductSync] ❌ CHECKPOINT: ERROR - Failed pushing to Algolia index:`, algoliaErr.message);
  }
}
