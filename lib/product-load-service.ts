import { pool } from '@/db';
import { organizations } from '@/db/schema';
import { getRunningRun } from './admin-sync-helpers';

type Org = typeof organizations.$inferSelect;

const BATCH_SIZE = 500;

const COLUMNS = [
  'sfid', 'productcode', 'name', 'description', 'isactive', 'family',
  'gtherp__price__c', 'list_price__c', 'gtherp__stock_quantity__c',
  'gtherp__available_quantity__c', 'gtherp__discount__c',
  'gtherp__category__c', 'gtherp__sub_category__c',
  'manufacturer_name__c', 'gtherp__brand_name__c', 'product_availability__c',
  'createddate', 'systemmodstamp',
] as const;

async function getSalesforceToken(org: Org) {
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
           gtherp__Product_Availability__c, gtherp__Manufacturer_Name__r.Name, gtherp__Brand_Name__r.Name,
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

function toRow(p: any): any[] {
  const pricebookEntries = p.PricebookEntries?.records || [];
  const sellingPrice = pricebookEntries[0]?.gtherp__Selling_Unit_Price__c ?? 0;
  const listPrice = pricebookEntries[0]?.UnitPrice ?? 0;

  return [
    p.Id, p.ProductCode, p.Name, p.Description, p.IsActive, p.Family,
    sellingPrice, listPrice,
    p.gtherp__Available_To_Sell__c ?? 0,
    p.gtherp__Available_To_Sell__c ?? 0,
    0,
    p.Family || 'No Category', '',
    p.gtherp__Manufacturer_Name__r?.Name || '',
    p.gtherp__Brand_Name__r?.Name || '',
    p.gtherp__Product_Availability__c || '',
    p.CreatedDate, p.SystemModstamp || null,
  ];
}

function buildUpsertQuery(schemaName: string, rowCount: number): string {
  const valuesSql = Array.from({ length: rowCount }, (_, i) => {
    const base = i * COLUMNS.length;
    const placeholders = COLUMNS.map((_, j) => `$${base + j + 1}`).join(', ');
    return `(${placeholders})`;
  }).join(',\n');

  return `
    INSERT INTO "${schemaName}".product2 (${COLUMNS.join(', ')})
    VALUES ${valuesSql}
    ON CONFLICT (sfid) DO UPDATE SET
      productcode = EXCLUDED.productcode,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      isactive = EXCLUDED.isactive,
      family = EXCLUDED.family,
      gtherp__price__c = EXCLUDED.gtherp__price__c,
      list_price__c = EXCLUDED.list_price__c,
      gtherp__stock_quantity__c = EXCLUDED.gtherp__stock_quantity__c,
      gtherp__available_quantity__c = EXCLUDED.gtherp__available_quantity__c,
      gtherp__category__c = EXCLUDED.gtherp__category__c,
      gtherp__sub_category__c = EXCLUDED.gtherp__sub_category__c,
      manufacturer_name__c = EXCLUDED.manufacturer_name__c,
      gtherp__brand_name__c = EXCLUDED.gtherp__brand_name__c,
      product_availability__c = EXCLUDED.product_availability__c,
      systemmodstamp = EXCLUDED.systemmodstamp
  `;
}

/** Starts (or joins an already-running) Load run for this org schema. */
export async function startLoadRun(schemaName: string) {
  const running = await getRunningRun(schemaName, 'product_sync_runs');
  if (running) {
    return { runId: running.id as string, status: running.status as string, startedAt: running.started_at, alreadyRunning: true };
  }

  const result = await pool.query(
    `INSERT INTO "${schemaName}".product_sync_runs DEFAULT VALUES RETURNING id, status, started_at`
  );
  const row = result.rows[0];
  return { runId: row.id as string, status: row.status as string, startedAt: row.started_at, alreadyRunning: false };
}

/**
 * Runs the Salesforce -> product2 load for a run started by startLoadRun,
 * updating progress as it goes. Intended to be invoked without awaiting so the
 * caller (the load API route) can respond immediately — safe because Heroku
 * web dynos are long-lived processes, unlike serverless functions.
 */
export async function runLoadAsync(schemaName: string, runId: string, org: Org): Promise<void> {
  const client = await pool.connect();
  let upserted = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const { accessToken, instanceUrl } = await getSalesforceToken(org);
    const products = await fetchAllProducts(accessToken, instanceUrl);

    await client.query(
      `UPDATE "${schemaName}".product_sync_runs SET salesforce_total = $1 WHERE id = $2`,
      [products.length, runId]
    );

    // Idempotent, matches the defensive migration in the original combined sync route.
    await client.query(
      `ALTER TABLE "${schemaName}".product2 ADD COLUMN IF NOT EXISTS list_price__c NUMERIC;`
    );

    const active = products.filter((p) => {
      if (p.IsActive !== true && p.IsActive !== 'true') {
        skipped++;
        return false;
      }
      return true;
    });

    for (let i = 0; i < active.length; i += BATCH_SIZE) {
      const chunk = active.slice(i, i + BATCH_SIZE);
      const rows = chunk.map(toRow);

      try {
        await client.query(buildUpsertQuery(schemaName, rows.length), rows.flat());
        upserted += rows.length;
      } catch (batchErr) {
        // Isolate the failure to this chunk by retrying row-by-row, so one bad
        // record doesn't drop an entire batch of otherwise-good products.
        for (const row of rows) {
          try {
            await client.query(buildUpsertQuery(schemaName, 1), row);
            upserted++;
          } catch {
            failed++;
          }
        }
      }

      await client.query(
        `UPDATE "${schemaName}".product_sync_runs
            SET upserted_count = $1, skipped_count = $2, failed_count = $3
          WHERE id = $4`,
        [upserted, skipped, failed, runId]
      );
    }

    await client.query(
      `UPDATE "${schemaName}".product_sync_runs
          SET status = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
      [failed > 0 ? 'completed_with_errors' : 'completed', runId]
    );
  } catch (error: any) {
    await client.query(
      `UPDATE "${schemaName}".product_sync_runs
          SET status = 'failed', error_message = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2`,
      [error.message?.slice(0, 1000) ?? 'Unknown error', runId]
    );
  } finally {
    client.release();
  }
}

export async function getLoadRunStatus(schemaName: string, runId: string) {
  const result = await pool.query(
    `SELECT * FROM "${schemaName}".product_sync_runs WHERE id = $1`,
    [runId]
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    type: 'load' as const,
    runId: row.id as string,
    status: row.status as string,
    salesforceTotal: row.salesforce_total as number,
    upserted: row.upserted_count as number,
    skipped: row.skipped_count as number,
    failed: row.failed_count as number,
    errorMessage: row.error_message as string | null,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}
