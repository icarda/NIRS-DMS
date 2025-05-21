CREATE TYPE "public"."action" AS ENUM('add', 'edit', 'delete');--> statement-breakpoint
CREATE TYPE "public"."scope" AS ENUM('study', 'trial');--> statement-breakpoint
CREATE TABLE "metadata_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" "action" NOT NULL,
	"scope" "scope" NOT NULL,
	"target" text NOT NULL,
	"before" text DEFAULT '',
	"after" text DEFAULT '',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "metadata_log" ADD CONSTRAINT "metadata_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;