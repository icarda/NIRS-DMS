ALTER TABLE "trait" DROP CONSTRAINT "trait_crop_id_crop_id_fk";
--> statement-breakpoint
ALTER TABLE "trait" ADD COLUMN "crop_trait_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "trait" ADD CONSTRAINT "trait_crop_trait_id_crop_trait_id_fk" FOREIGN KEY ("crop_trait_id") REFERENCES "public"."crop_trait"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait" DROP COLUMN "unit";--> statement-breakpoint
ALTER TABLE "trait" DROP COLUMN "crop_id";