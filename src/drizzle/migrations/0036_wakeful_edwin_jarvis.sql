CREATE TYPE "public"."client_status" AS ENUM('active', 'inactive', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('public', 'confidential');