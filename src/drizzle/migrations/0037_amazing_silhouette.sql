ALTER TABLE "api_clients" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "api_clients" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "api_clients" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;