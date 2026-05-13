import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import algoliasearch from 'algoliasearch';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schemaName, indexName } = body;

    if (!schemaName || !indexName) {
      return NextResponse.json({ error: 'Schema name and index name are required' }, { status: 400 });
    }

    const sanitizedSchemaName = schemaName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const sanitizedIndexName = indexName; // Can be any valid Algolia index name string

    console.log(`Provisioning schema: ${sanitizedSchemaName}, Index: ${sanitizedIndexName}`);

    // 1. Create the new schema
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS ${sanitizedSchemaName};`));

    // 2. Create the product2 table within the new schema
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

    // 3. Load and transform the algolia.sql file
    const algoliaSqlPath = path.join(process.cwd(), 'db/algolia.sql');
    let algoliaSqlContent = fs.readFileSync(algoliaSqlPath, 'utf8');

    // Replace schema references
    let transformedSqlContent = algoliaSqlContent.replace(/salesforce\./g, `${sanitizedSchemaName}.`);
    
    // Replace the default index name inside the insert statement config
    transformedSqlContent = transformedSqlContent.replace(
      /'dev_woven_products'/g, 
      `'${sanitizedIndexName}'`
    );

    // 4. Execute the transformed SQL script
    await db.execute(sql.raw(transformedSqlContent));

    // 5. Create the Algolia index
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    const algoliaAdminKey = process.env.ALGOLIA_ADMIN_KEY;
    
    if (algoliaAppId && algoliaAdminKey) {
      const client = algoliasearch(algoliaAppId, algoliaAdminKey);
      const index = client.initIndex(sanitizedIndexName);
      
      // Save an init object to ensure the index is fully created in Algolia Dashboard
      await index.saveObject({
        objectID: 'init',
        message: 'Index created automatically via Admin Provisioning',
        created_at: Date.now()
      });
      
      // Set basic default settings based on existing app configs
      await index.setSettings({
        searchableAttributes: ['name', 'description', 'productcode', 'family', 'gtherp__category__c', 'gtherp__sub_category__c', 'manufacturer_name__c'],
        attributesForFaceting: ['family', 'gtherp__category__c', 'gtherp__sub_category__c', 'manufacturer_name__c', 'product_availability__c'],
      });
      
      console.log(`Algolia index ${sanitizedIndexName} initialized successfully.`);
    } else {
      console.warn("ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY missing. Algolia index not created via API.");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Schema ${sanitizedSchemaName} and Index ${sanitizedIndexName} provisioned successfully.` 
    });

  } catch (error: any) {
    console.error('Error provisioning tenant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
