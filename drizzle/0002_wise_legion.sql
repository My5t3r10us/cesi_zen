CREATE TABLE "article_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color_hex" varchar(7) DEFAULT '#8A9A5B' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_categories_label_unique" UNIQUE("label"),
	CONSTRAINT "article_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "emotion_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"color_hex" varchar(7) NOT NULL,
	"icon_name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emotion_categories_label_unique" UNIQUE("label")
);
--> statement-breakpoint
ALTER TABLE "emotions" ALTER COLUMN "color_hex" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emotions" ALTER COLUMN "icon_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "cover_image" varchar(500);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "emotions" ADD COLUMN "category_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "emotions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_category_id_emotion_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."emotion_categories"("id") ON DELETE cascade ON UPDATE no action;