ALTER TABLE "profiles" ADD COLUMN "email" text;--> statement-breakpoint
UPDATE "profiles"
SET "email" = "auth"."users"."email"
FROM "auth"."users"
WHERE "profiles"."id" = "auth"."users"."id";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_unique" UNIQUE("email");
