ALTER TABLE "product_type" DROP CONSTRAINT "product_type_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "physiological_stage_unique" ON "physiological_stage" USING btree ("name","crop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_type_unique" ON "product_type" USING btree ("name","crop_id");