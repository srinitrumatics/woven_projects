const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
client.connect().then(() => client.query(`
    CREATE SCHEMA IF NOT EXISTS salesforce;
    CREATE TABLE IF NOT EXISTS salesforce.product2 (
        sfid varchar(18) primary key,
        productcode varchar(255),
        name varchar(255),
        description text,
        isactive boolean,
        family varchar(255),
        image_url jsonb,
        gtherp__price__c numeric,
        gtherp__stock_quantity__c numeric,
        gtherp__available_quantity__c numeric,
        gtherp__discount__c numeric,
        gtherp__category__c varchar(255),
        gtherp__sub_category__c varchar(255),
        manufacturer_name__c varchar(255),
        createddate timestamp,
        systemmodstamp timestamp
    );
`)).then(() => { console.log('Table created'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
