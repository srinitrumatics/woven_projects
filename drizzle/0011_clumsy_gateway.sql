ALTER TABLE "organizations" ADD COLUMN "org_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "salesforce_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "salesforce_auth_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "client_secret" text;--> statement-breakpoint
ALTER TABLE "salesforce"."product2" ADD COLUMN "product_availability__c" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_org_id_unique" UNIQUE("org_id");