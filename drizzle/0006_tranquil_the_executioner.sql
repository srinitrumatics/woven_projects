-- Step 1: Drop all FK constraints referencing the columns being changed to uuid
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS "permissions_group_id_permission_groups_id_fk";--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_role_id_roles_id_fk";--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permission_id_permissions_id_fk";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_role_id_roles_id_fk";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "user_organizations" DROP CONSTRAINT IF EXISTS "user_organizations_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "user_organizations" DROP CONSTRAINT IF EXISTS "user_organizations_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "role_organizations" DROP CONSTRAINT IF EXISTS "role_organizations_role_id_roles_id_fk";--> statement-breakpoint
ALTER TABLE "role_organizations" DROP CONSTRAINT IF EXISTS "role_organizations_organization_id_organizations_id_fk";--> statement-breakpoint

-- Step 2: Change PK (identity) columns to uuid — must DROP IDENTITY first
ALTER TABLE "organizations" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

ALTER TABLE "permission_groups" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "permission_groups" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "permission_groups" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

ALTER TABLE "permissions" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

ALTER TABLE "roles" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

-- Step 3: Change FK columns to uuid
ALTER TABLE "permissions" ALTER COLUMN "group_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_organizations" ALTER COLUMN "role_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_organizations" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "role_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_organizations" ALTER COLUMN "user_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_organizations" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "role_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "organization_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint

-- Step 4: Re-add FK constraints now that all column types match
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_group_id_permission_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."permission_groups"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_organizations" ADD CONSTRAINT "role_organizations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_organizations" ADD CONSTRAINT "role_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;