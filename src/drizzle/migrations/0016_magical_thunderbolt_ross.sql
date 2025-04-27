DROP INDEX "other_ids_unique";--> statement-breakpoint
ALTER TABLE "other_ids" ADD COLUMN "study_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "other_ids" ADD CONSTRAINT "other_ids_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."study"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "other_ids_unique" ON "other_ids" USING btree ("study_id","sample_id","plot_id","gid");