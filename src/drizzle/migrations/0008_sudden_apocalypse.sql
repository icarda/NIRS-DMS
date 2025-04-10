ALTER TABLE "species" DROP CONSTRAINT "species_crop_id_crop_id_fk";
--> statement-breakpoint
ALTER TABLE "trial" DROP CONSTRAINT "trial_species_id_species_id_fk";
--> statement-breakpoint
ALTER TABLE "species" ADD COLUMN "trial_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_trial_id_trial_id_fk" FOREIGN KEY ("trial_id") REFERENCES "public"."trial"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "species" DROP COLUMN "crop_id";--> statement-breakpoint
ALTER TABLE "trial" DROP COLUMN "species_id";