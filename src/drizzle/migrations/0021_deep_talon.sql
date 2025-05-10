ALTER TABLE "trial_metadata_config" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trial_metadata_config" ALTER COLUMN "type" SET DEFAULT 'String';--> statement-breakpoint
ALTER TABLE "trial_metadata_config" ALTER COLUMN "default_value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trial_metadata_config" ALTER COLUMN "required" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trial_metadata_config" ALTER COLUMN "source" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."trial_metadata_config" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('String', 'Number', 'Date', 'Boolean', 'Array');--> statement-breakpoint
ALTER TABLE "public"."trial_metadata_config" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";