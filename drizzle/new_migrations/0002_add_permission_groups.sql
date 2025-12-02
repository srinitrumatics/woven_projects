-- Migration number: 0002
CREATE TABLE "permission_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "permission_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE "permissions" ADD COLUMN "group_id" integer;

ALTER TABLE "permissions" ADD CONSTRAINT "permissions_group_id_permission_groups_id_fk" 
  FOREIGN KEY ("group_id") REFERENCES "public"."permission_groups"("id") 
  ON DELETE set null ON UPDATE cascade;