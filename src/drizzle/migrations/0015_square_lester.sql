CREATE TABLE "other_ids" (
	"id" serial PRIMARY KEY NOT NULL,
	"sample_id" integer NOT NULL,
	"plot_id" integer NOT NULL,
	"gid" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nirs_data" DROP CONSTRAINT "nirs_data_study_id_sample_id_gid_plot_id_wavelength_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "other_ids_unique" ON "other_ids" USING btree ("sample_id","plot_id","gid");--> statement-breakpoint
ALTER TABLE "nirs_data" DROP COLUMN "gid";--> statement-breakpoint
ALTER TABLE "nirs_data" DROP COLUMN "plot_id";--> statement-breakpoint
ALTER TABLE "nirs_data" ADD CONSTRAINT "nirs_data_study_id_sample_id_wavelength_unique" UNIQUE("study_id","sample_id","wavelength");