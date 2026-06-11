import { NextResponse } from 'next/server';
import { db, pool } from '@/db';
import { sql } from 'drizzle-orm';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import algoliasearch from 'algoliasearch';

async function getSalesforceToken(org: any) {
  const tokenUrl = org.salesforceAuthUrl || process.env.SF_AUTH_URL || '';
  const clientId = org.clientId || process.env.SF_CLIENT_ID || '';
  const clientSecret = org.clientSecret || process.env.SF_CLIENT_SECRET || '';

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error('Missing Salesforce credentials for this organization');
  }

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Salesforce auth failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    instanceUrl: (data.instance_url || org.salesforceUrl || process.env.SF_DATA_URL) as string,
  };
}

async function fetchAllProducts(accessToken: string, instanceUrl: string) {
  const query = `
    SELECT Id, ProductCode, Name, Description, IsActive, Family, CreatedDate, SystemModstamp,
           gtherp__Product_Availability__c, gtherp__Manufacturer_Name__c,
           gtherp__Available_To_Sell__c,
           (SELECT Id, Name, UnitPrice, gtherp__Selling_Unit_Price__c FROM PricebookEntries)
    FROM Product2
    WHERE IsActive = true
  `;

  let url = `${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;
  const records: any[] = [];

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Salesforce query failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    records.push(...data.records);
    url = data.nextRecordsUrl ? `${instanceUrl}${data.nextRecordsUrl}` : '';
  }

  return records;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 1. Fetch org
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const schemaName = org.algoliaSchema;
  const indexName  = org.algoliaIndexName;

  if (!schemaName) {
    return NextResponse.json({ error: 'Organization has no database schema configured' }, { status: 400 });
  }
  if (!indexName) {
    return NextResponse.json({ error: 'Organization has no Algolia index configured' }, { status: 400 });
  }

  const sanitizedSchema = schemaName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  try {
    // 2. Authenticate with Salesforce
    const { accessToken, instanceUrl } = await getSalesforceToken(org);

    // 3. Fetch products from Salesforce
    const products = await fetchAllProducts(accessToken, instanceUrl);

    // 4. Upsert into product2 table using the shared connection pool
    const client = await pool.connect();

    let upserted = 0;
    let skipped = 0;

    try {
      // Ensure list_price__c column exists (idempotent migration)
      await client.query(
        `ALTER TABLE "${sanitizedSchema}".product2 ADD COLUMN IF NOT EXISTS list_price__c NUMERIC;`
      );

      for (const p of products) {
        if (p.IsActive !== true && p.IsActive !== 'true') { skipped++; continue; }

        const pricebookEntries = p.PricebookEntries?.records || [];
        const sellingPrice = pricebookEntries[0]?.gtherp__Selling_Unit_Price__c ?? 0;
        const listPrice    = pricebookEntries[0]?.UnitPrice ?? 0;

        await client.query(
          `INSERT INTO "${sanitizedSchema}".product2 (
              sfid, productcode, name, description, isactive, family,
              gtherp__price__c, list_price__c, gtherp__stock_quantity__c,
              gtherp__available_quantity__c, gtherp__discount__c,
              gtherp__category__c, gtherp__sub_category__c,
              manufacturer_name__c, product_availability__c,
              createddate, systemmodstamp
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
           ON CONFLICT (sfid) DO UPDATE SET
              productcode            = EXCLUDED.productcode,
              name                   = EXCLUDED.name,
              description            = EXCLUDED.description,
              isactive               = EXCLUDED.isactive,
              family                 = EXCLUDED.family,
              gtherp__price__c       = EXCLUDED.gtherp__price__c,
              list_price__c          = EXCLUDED.list_price__c,
              gtherp__stock_quantity__c         = EXCLUDED.gtherp__stock_quantity__c,
              gtherp__available_quantity__c     = EXCLUDED.gtherp__available_quantity__c,
              gtherp__category__c    = EXCLUDED.gtherp__category__c,
              gtherp__sub_category__c= EXCLUDED.gtherp__sub_category__c,
              manufacturer_name__c   = EXCLUDED.manufacturer_name__c,
              product_availability__c= EXCLUDED.product_availability__c,
              systemmodstamp         = EXCLUDED.systemmodstamp`,
          [
            p.Id, p.ProductCode, p.Name, p.Description, p.IsActive, p.Family,
            sellingPrice, listPrice,
            p.gtherp__Available_To_Sell__c ?? 0,
            p.gtherp__Available_To_Sell__c ?? 0,
            0,
            p.Family || 'No Category', '',
            p.gtherp__Manufacturer_Name__c || '',
            p.gtherp__Product_Availability__c || '',
            p.CreatedDate, p.SystemModstamp || null,
          ]
        );
        upserted++;
      }
    } finally {
      client.release();
    }

    // 5. Push all products to Algolia directly
    const algoliaAppId   = process.env.ALGOLIA_APP_ID   || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
    const algoliaAdminKey = process.env.ALGOLIA_ADMIN_KEY || '';

    let algoliaResult = { pushed: 0, error: '' };

    if (algoliaAppId && algoliaAdminKey) {
      // Re-read all rows from the product2 table and push to Algolia
      const rows = await db.execute(
        sql.raw(`SELECT * FROM "${sanitizedSchema}".product2 WHERE isactive = true`)
      );

      const algoliaObjects = (rows.rows as any[]).map((row) => {
        const images = row.image_url?.images || [];
        return {
          objectID:             row.sfid,
          sku:                  row.productcode,
          name:                 row.name,
          description:          row.description,
          price:                row.gtherp__price__c ?? 0,
          listPrice:            row.list_price__c ?? 0,
          unitPrice:            row.gtherp__price__c ?? 0,
          stock_quantity:       row.gtherp__stock_quantity__c ?? 0,
          available_quantity:   row.gtherp__available_quantity__c ?? 0,
          discount:             row.gtherp__discount__c ?? 0,
          image_url:            images[0]?.url ?? null,
          images,
          category:             row.gtherp__category__c,
          family:               row.family,
          sub_category:         row.gtherp__sub_category__c,
          manufacturer:         row.manufacturer_name__c,
          status:               row.isactive ? 'active' : 'inactive',
          is_active:            row.isactive,
          product_availability: row.product_availability__c,
          Availability_Status__c: row.product_availability__c,
          created_at: row.createddate ? Math.floor(new Date(row.createddate).getTime() / 1000) : null,
          updated_at: row.systemmodstamp ? Math.floor(new Date(row.systemmodstamp).getTime() / 1000) : null,
          _tags: [row.family, row.gtherp__category__c, row.gtherp__sub_category__c, row.manufacturer_name__c, row.product_availability__c].filter(Boolean),
        };
      });

      const algoliaClient = algoliasearch(algoliaAppId, algoliaAdminKey);
      const index = algoliaClient.initIndex(indexName);

      // saveObjects in chunks of 1000 (Algolia limit)
      const chunkSize = 1000;
      for (let i = 0; i < algoliaObjects.length; i += chunkSize) {
        await index.saveObjects(algoliaObjects.slice(i, i + chunkSize));
      }

      // Configure facets & search settings after push
      await index.setSettings({
        searchableAttributes: [
          'name',
          'sku',
          'description',
          'manufacturer',
          'category',
          'family',
          'sub_category',
        ],
        attributesForFaceting: [
          'filterOnly(is_active)',
          'searchable(category)',
          'searchable(family)',
          'searchable(sub_category)',
          'searchable(manufacturer)',
          'searchable(product_availability)',
          'searchable(Availability_Status__c)',
          'status',
        ],
        customRanking: ['desc(updated_at)'],
        attributesToRetrieve: ['*'],
        attributesToHighlight: ['name', 'sku', 'description'],
      });

      algoliaResult.pushed = algoliaObjects.length;
    } else {
      algoliaResult.error = 'Algolia credentials missing – DB was updated but index was not pushed.';
    }

    return NextResponse.json({
      success: true,
      summary: {
        salesforceTotal: products.length,
        dbUpserted: upserted,
        dbSkipped: skipped,
        algoliaPushed: algoliaResult.pushed,
        algoliaWarning: algoliaResult.error || null,
      },
    });

  } catch (error: any) {
    console.error(`[sync] Error for org ${id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
