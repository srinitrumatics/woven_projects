ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "permission_groups" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "permission_groups" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "permission_groups" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "group_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_organizations" ALTER COLUMN "role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_organizations" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "user_organizations" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_organizations" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "role_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;