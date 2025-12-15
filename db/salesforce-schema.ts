
import { pgSchema, varchar, text, boolean, numeric, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Define the salesforce schema
export const salesforceSchema = pgSchema('salesforce');

// Define the product2 table within the salesforce schema
export const product2 = salesforceSchema.table('product2', {
    sfid: varchar('sfid', { length: 18 }).primaryKey(),
    productCode: varchar('productcode', { length: 255 }),
    name: varchar('name', { length: 255 }),
    description: text('description'),
    isActive: boolean('isactive'),
    family: varchar('family', { length: 255 }),
    imageUrl: jsonb('image_url'), // JSONB field for images

    // Custom fields (using snake_case as per Drizzle convention for mapping to specific DB columns)
    // Mapping to Salesforce field names which seem to be lowercase in the SQL dump provided
    price: numeric('gtherp__price__c'),
    stockQuantity: numeric('gtherp__stock_quantity__c'),
    availableQuantity: numeric('gtherp__available_quantity__c'),
    discount: numeric('gtherp__discount__c'),
    category: varchar('gtherp__category__c', { length: 255 }),
    subCategory: varchar('gtherp__sub_category__c', { length: 255 }),

    createdDate: timestamp('createddate'),
    systemModStamp: timestamp('systemmodstamp'),
});

// Types
export type Product2 = typeof product2.$inferSelect;
export type NewProduct2 = typeof product2.$inferInsert;
