ALTER TABLE "trial_metadata_config" ALTER COLUMN "type" SET DEFAULT 'string';--> statement-breakpoint
ALTER TABLE "public"."trial_metadata_config" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('string', 'number', 'date', 'boolean', 'array');--> statement-breakpoint
ALTER TABLE "public"."trial_metadata_config" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";