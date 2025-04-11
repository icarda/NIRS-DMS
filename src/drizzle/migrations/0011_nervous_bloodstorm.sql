CREATE TABLE "trial_species" (
	"trial_id" integer NOT NULL,
	"species_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "species" DROP CONSTRAINT "species_trial_id_trial_id_fk";
--> statement-breakpoint
ALTER TABLE "trial_species" ADD CONSTRAINT "trial_species_trial_id_trial_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."trial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_species" ADD CONSTRAINT "trial_species_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" DROP COLUMN "trial_id";