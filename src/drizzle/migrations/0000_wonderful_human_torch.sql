CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN', 'SUPERADMIN');--> statement-breakpoint
CREATE TABLE "center" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"acronym" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "center_acronym_unique" UNIQUE("acronym")
);
--> statement-breakpoint
CREATE TABLE "crop_common_name" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"common_name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crop_common_name_common_name_unique" UNIQUE("common_name")
);
--> statement-breakpoint
CREATE TABLE "crop" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"crop_image_url" text,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crop_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "nir_model" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"wavelength_range" text NOT NULL,
	"resolution" text NOT NULL,
	"manufacturer" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nir_model_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "nirs_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"study_id" integer NOT NULL,
	"sample_id" integer NOT NULL,
	"gid" integer NOT NULL,
	"plot_id" integer NOT NULL,
	"wavelength" integer NOT NULL,
	"value" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_lab" (
	"id" serial PRIMARY KEY NOT NULL,
	"center_id" integer NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"country" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quality_lab_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "physiological_stage" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"crop_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "physiological_stage_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"crop_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "species_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "study" (
	"id" serial PRIMARY KEY NOT NULL,
	"trial_id" integer NOT NULL,
	"study_code" text NOT NULL,
	"product_type_id" integer NOT NULL,
	"nir_model_id" integer NOT NULL,
	"requester_name" text NOT NULL,
	"requester_email" text NOT NULL,
	"sample_date" date NOT NULL,
	"physiological_stage_id" integer NOT NULL,
	"additional_metadata" jsonb DEFAULT '{}'::jsonb,
	"quality_lab_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crop_trait" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"trait_name" text NOT NULL,
	"entity" text NOT NULL,
	"method_description" text,
	"unit" text NOT NULL,
	"minimum_allowed" integer,
	"maximum_allowed" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trait" (
	"id" serial PRIMARY KEY NOT NULL,
	"trait_name" text NOT NULL,
	"measured_value" double precision NOT NULL,
	"predicted_value" double precision,
	"year" integer NOT NULL,
	"unit" text NOT NULL,
	"study_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"sample_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trial_fertilizer" (
	"id" serial PRIMARY KEY NOT NULL,
	"trial_id" integer NOT NULL,
	"fertilizer_type" text NOT NULL,
	"fertilizer_amount" double precision NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trial" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"planting_date" date NOT NULL,
	"soil_type" text NOT NULL,
	"irrigation" boolean NOT NULL,
	"location" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"additional_metadata" jsonb DEFAULT '{}'::jsonb,
	"species_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"location" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"country" text NOT NULL,
	"center_id" integer NOT NULL,
	"position" text NOT NULL,
	"emailVerified" timestamp,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
ALTER TABLE "crop_common_name" ADD CONSTRAINT "crop_common_name_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nirs_data" ADD CONSTRAINT "nirs_data_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."study"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_lab" ADD CONSTRAINT "quality_lab_center_id_center_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."center"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physiological_stage" ADD CONSTRAINT "physiological_stage_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type" ADD CONSTRAINT "product_type_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_trial_id_trial_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."trial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_product_type_id_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_nir_model_id_nir_model_id_fk" FOREIGN KEY ("nir_model_id") REFERENCES "public"."nir_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_physiological_stage_id_physiological_stage_id_fk" FOREIGN KEY ("physiological_stage_id") REFERENCES "public"."physiological_stage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_quality_lab_id_quality_lab_id_fk" FOREIGN KEY ("quality_lab_id") REFERENCES "public"."quality_lab"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crop_trait" ADD CONSTRAINT "crop_trait_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait" ADD CONSTRAINT "trait_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."study"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait" ADD CONSTRAINT "trait_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_fertilizer" ADD CONSTRAINT "trial_fertilizer_trial_id_trial_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."trial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial" ADD CONSTRAINT "trial_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial" ADD CONSTRAINT "trial_crop_id_crop_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_center_id_center_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."center"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;