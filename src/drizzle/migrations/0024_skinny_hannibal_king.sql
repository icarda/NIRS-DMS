CREATE TABLE "study_metadata_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"name" text NOT NULL,
	"type" "type" DEFAULT 'string' NOT NULL,
	"default_value" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"min" double precision,
	"max" double precision,
	"source" text NOT NULL,
	CONSTRAINT "study_metadata_config_name_unique" UNIQUE("name")
);
