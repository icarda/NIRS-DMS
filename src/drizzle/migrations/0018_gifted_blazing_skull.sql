CREATE TYPE "public"."type" AS ENUM('string', 'number', 'date', 'boolean', 'array');--> statement-breakpoint
CREATE TABLE "trial_metadata_config" (
	"name" text PRIMARY KEY NOT NULL,
	"label" text,
	"type" "type" DEFAULT 'string' NOT NULL,
	"default_value" text,
	"required" boolean DEFAULT false,
	"min" double precision,
	"max" double precision,
	"source" text
);
