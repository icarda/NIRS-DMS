ALTER TABLE "trial" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "nirs_data" ADD COLUMN "species_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "nirs_data" ADD CONSTRAINT "nirs_data_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;