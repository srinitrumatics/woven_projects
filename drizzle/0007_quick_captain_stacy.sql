CREATE SCHEMA IF NOT EXISTS "salesforce";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"key_hash" text NOT NULL,
	"prefix" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rate_limit" integer DEFAULT 60 NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_used_at" text,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "salesforce"."product2" (
	"sfid" varchar(18) PRIMARY KEY NOT NULL,
	"productcode" varchar(255),
	"name" varchar(255),
	"description" text,
	"isactive" boolean,
	"family" varchar(255),
	"image_url" jsonb,
	"gtherp__price__c" numeric,
	"gtherp__stock_quantity__c" numeric,
	"gtherp__available_quantity__c" numeric,
	"gtherp__discount__c" numeric,
	"gtherp__category__c" varchar(255),
	"gtherp__sub_category__c" varchar(255),
	"createddate" timestamp,
	"systemmodstamp" timestamp
);
