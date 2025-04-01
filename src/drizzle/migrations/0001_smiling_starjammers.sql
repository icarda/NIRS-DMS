ALTER TABLE "trial_fertilizer" RENAME COLUMN "fertilizer_type" TO "amount";--> statement-breakpoint
ALTER TABLE "study" ALTER COLUMN "requester_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "study" ALTER COLUMN "requester_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trial" ALTER COLUMN "latitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trial" ALTER COLUMN "longitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trial_fertilizer" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trial_fertilizer" DROP COLUMN "fertilizer_amount";--> statement-breakpoint
ALTER TABLE "study" ADD CONSTRAINT "study_study_code_unique" UNIQUE("study_code");