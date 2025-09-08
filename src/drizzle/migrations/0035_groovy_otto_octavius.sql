CREATE TABLE "api_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"client_secret_hash" text,
	"clientType" "client_type" NOT NULL,
	"status" "client_status" DEFAULT 'active' NOT NULL,
	"scopes" text DEFAULT 'read:data' NOT NULL,
	CONSTRAINT "api_clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_client_id_api_clients_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."api_clients"("client_id") ON DELETE no action ON UPDATE no action;