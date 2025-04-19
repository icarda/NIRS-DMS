ALTER TABLE "trial" ALTER COLUMN "soil_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "study" ADD COLUMN "program" text NOT NULL;