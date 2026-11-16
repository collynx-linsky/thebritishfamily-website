CREATE TABLE "admin_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "content_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"snapshot" jsonb,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_sections" (
	"key" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_format" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"file_pages" integer,
	"published_at" date NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "downloads_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"sector_slug" text,
	"show_on_home" boolean DEFAULT false NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaders" (
	"slug" text PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"summary" text NOT NULL,
	"bio" text NOT NULL,
	"email" text NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair_key" text NOT NULL,
	"account_key" text NOT NULL,
	"success" boolean NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"category" text NOT NULL,
	"published_at" date NOT NULL,
	"body" jsonb NOT NULL,
	"image_url" text NOT NULL,
	"image_alt" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"slug" text PRIMARY KEY NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"icon" text NOT NULL,
	"summary" text NOT NULL,
	"headline" text NOT NULL,
	"overview" jsonb NOT NULL,
	"focus" jsonb NOT NULL,
	"image_url" text,
	"image_alt" text,
	"image_width" integer,
	"image_height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"kind" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uploads_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_sector_slug_sectors_slug_fk" FOREIGN KEY ("sector_slug") REFERENCES "public"."sectors"("slug") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_hash_idx" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_history_entity_idx" ON "content_history" USING btree ("entity_type","entity_id","saved_at");--> statement-breakpoint
CREATE INDEX "login_attempts_pair_idx" ON "login_attempts" USING btree ("pair_key","attempted_at");--> statement-breakpoint
CREATE INDEX "login_attempts_account_idx" ON "login_attempts" USING btree ("account_key","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_slug_idx" ON "news_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "uploads_status_idx" ON "uploads" USING btree ("status","status_changed_at");