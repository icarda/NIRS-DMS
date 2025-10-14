ALTER TABLE "nirs_data" ALTER COLUMN "sample_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trait" ALTER COLUMN "sample_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trial_species" ALTER COLUMN "species_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "other_ids" ALTER COLUMN "sample_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "other_ids" ALTER COLUMN "plot_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "other_ids" ALTER COLUMN "gid" SET DATA TYPE text;