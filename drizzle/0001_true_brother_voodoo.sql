CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "emotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"color_hex" varchar(7) NOT NULL,
	"icon_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"emotion_id" integer NOT NULL,
	"intensity" integer NOT NULL,
	"note_encrypted" text,
	"context_tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Step 1: Add temporary uuid column
ALTER TABLE "users" ADD COLUMN "id_new" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
-- Step 2: Generate UUIDs for existing rows
UPDATE "users" SET "id_new" = gen_random_uuid();--> statement-breakpoint
-- Step 3: Make id_new NOT NULL
ALTER TABLE "users" ALTER COLUMN "id_new" SET NOT NULL;--> statement-breakpoint
-- Step 4: Drop old primary key constraint
ALTER TABLE "users" DROP CONSTRAINT "users_pkey";--> statement-breakpoint
-- Step 5: Drop old id column
ALTER TABLE "users" DROP COLUMN "id";--> statement-breakpoint
-- Step 6: Rename new column to id
ALTER TABLE "users" RENAME COLUMN "id_new" TO "id";--> statement-breakpoint
-- Step 7: Add primary key constraint to new uuid id
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "nom" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "prenom" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_emotion_id_emotions_id_fk" FOREIGN KEY ("emotion_id") REFERENCES "public"."emotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updated_at";