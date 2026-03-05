CREATE TABLE IF NOT EXISTS "user_salesforce_profiles" (
	"user_id" uuid NOT NULL,
	"contact_id" text NOT NULL,
	"account_id" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_salesforce_profiles_pkey" PRIMARY KEY("user_id","account_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_salesforce_profiles" ADD CONSTRAINT "user_salesforce_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
