import { db } from '../db';
import * as fs from 'fs';
import * as path from 'path';
import { sql } from 'drizzle-orm';

/**
 * Provisions a new database schema for a specific organization/tenant.
 * This function will:
 * 1. Create a new PostgreSQL schema named after the organization
 * 2. Create the base Salesforce tables (like product2) in that schema
 * 3. Load, transform, and execute the algolia.sql script to create all 
 *    sync queues, logs, triggers, and views inside the new schema.
 */
export async function provisionTenantSchema(schemaName: string) {
  // 1. Sanitize the schema name to prevent SQL injection
  const sanitizedSchemaName = schemaName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  console.log(`Provisioning new tenant schema: ${sanitizedSchemaName}`);

  try {
    // 2. Create the new schema
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${sanitizedSchemaName};`));
    console.log(`✅ Schema ${sanitizedSchemaName} created.`);

    // 3. Create the product2 table within the new schema
    // (This mirrors the structure from db/salesforce-schema.ts)
    const createProductTableSQL = `
      CREATE TABLE IF NOT EXISTS ${sanitizedSchemaName}.product2 (
          sfid VARCHAR(18) PRIMARY KEY,
          productcode VARCHAR(255),
          name VARCHAR(255),
          description TEXT,
          isactive BOOLEAN,
          family VARCHAR(255),
          image_url JSONB,
          gtherp__price__c NUMERIC,
          gtherp__stock_quantity__c NUMERIC,
          gtherp__available_quantity__c NUMERIC,
          gtherp__discount__c NUMERIC,
          gtherp__category__c VARCHAR(255),
          gtherp__sub_category__c VARCHAR(255),
          manufacturer_name__c VARCHAR(255),
          product_availability__c VARCHAR(255),
          createddate TIMESTAMP,
          systemmodstamp TIMESTAMP
      );
    `;
    await db.execute(sql.raw(createProductTableSQL));
    console.log(`✅ Table ${sanitizedSchemaName}.product2 created.`);

    // 4. Load the algolia.sql file
    const algoliaSqlPath = path.join(__dirname, '../db/algolia.sql');
    let algoliaSqlContent = fs.readFileSync(algoliaSqlPath, 'utf8');

    // 5. Replace the hardcoded 'salesforce.' schema with our new dynamic schema
    // We use a global regex replacement. Be careful to match word boundaries if needed,
    // but in algolia.sql it's strictly used as the schema prefix.
    const transformedSqlContent = algoliaSqlContent.replace(/salesforce\./g, `${sanitizedSchemaName}.`);

    // We also need to update the default index name inside the insert statement if needed
    // e.g., 'woven_products' -> '${sanitizedSchemaName}_products'
    const finalSqlContent = transformedSqlContent.replace(
      /'woven_products'/g,
      `'${sanitizedSchemaName}_products'`
    );

    // 6. Execute the transformed SQL script
    // Note: If the SQL script is very large or contains multiple statements, 
    // it's best to execute it directly. pg driver supports multiple statements.
    await db.execute(sql.raw(finalSqlContent));

    console.log(`✅ All Algolia sync tables, logs, views, and triggers created in ${sanitizedSchemaName}.`);
    console.log(`🎉 Tenant provisioning complete for ${sanitizedSchemaName}.`);

  } catch (error) {
    console.error(`❌ Failed to provision tenant schema ${sanitizedSchemaName}:`, error);
    throw error;
  }
}

// If running directly from CLI: npx ts-node scripts/provisionTenant.ts <schema_name>
if (require.main === module) {
  const schemaArg = process.argv[2];
  if (!schemaArg) {
    console.error("Please provide a schema name. Usage: npx ts-node scripts/provisionTenant.ts org_mycompany");
    process.exit(1);
  }

  provisionTenantSchema(schemaArg)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
