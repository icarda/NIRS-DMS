ALTER TABLE "crop_trait" ALTER COLUMN "method_description" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "crop_trait_unique" ON "crop_trait" USING btree ("crop_id","trait_variable");