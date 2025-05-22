CREATE TABLE "user_study_access" (
	"user_id" integer NOT NULL,
	"study_id" integer NOT NULL,
	CONSTRAINT "user_study_access_user_id_study_id_pk" PRIMARY KEY("user_id","study_id")
);
--> statement-breakpoint
ALTER TABLE "user_study_access" ADD CONSTRAINT "user_study_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_study_access" ADD CONSTRAINT "user_study_access_study_id_study_id_fk" FOREIGN KEY ("study_id") REFERENCES "public"."study"("id") ON DELETE cascade ON UPDATE no action;