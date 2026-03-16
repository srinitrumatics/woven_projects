ALTER TABLE "user_salesforce_profiles" DROP COLUMN IF EXISTS "account_id";--> statement-breakpoint
ALTER TABLE "user_salesforce_profiles" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "user_salesforce_profiles" DROP COLUMN IF EXISTS "updated_at";--> statement-breakpoint
ALTER TABLE "user_salesforce_profiles" DROP CONSTRAINT IF EXISTS "user_salesforce_profiles_pkey";--> statement-breakpoint
ALTER TABLE "user_salesforce_profiles" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "salesforce"."product2" ADD COLUMN IF NOT EXISTS "manufacturer_name__c" varchar(255);