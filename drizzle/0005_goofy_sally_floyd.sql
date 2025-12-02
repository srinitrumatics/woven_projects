CREATE TABLE "role_organizations" (
	"role_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	CONSTRAINT "role_organizations_role_id_organization_id_pk" PRIMARY KEY("role_id","organization_id")
);
--> statement-breakpoint
ALTER TABLE "role_organizations" ADD CONSTRAINT "role_organizations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_organizations" ADD CONSTRAINT "role_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;