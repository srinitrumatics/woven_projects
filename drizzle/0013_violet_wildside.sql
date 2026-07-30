DROP TABLE "api_keys" CASCADE;--> statement-breakpoint
DROP TABLE "role_organizations" CASCADE;--> statement-breakpoint
DROP TABLE "user_salesforce_profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "algolia_schema" text;--> statement-breakpoint
ALTER TABLE "salesforce"."product2" ADD COLUMN "list_price__c" numeric;