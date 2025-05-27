ALTER TABLE "other_ids" DROP CONSTRAINT "other_ids_study_id_study_id_fk";
--> statement-breakpoint
DROP INDEX "other_ids_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "other_ids_unique" ON "other_ids" USING btree ("sample_id","plot_id","gid");--> statement-breakpoint
ALTER TABLE "other_ids" DROP COLUMN "study_id";